
define(['jquery',
    'underscore',
    'backbone',
    'Models',
    'moment',
    'Utils',
    'text!templates/user.html',
    'text!templates/games_list.html',
    'text!templates/games_list_item.html',
    'text!templates/pre_game.html',
    'text!templates/player_list_item.html',
    'text!templates/in_game.html',
    'text!templates/pos_game.html',
    'text!templates/player_token.html',
    'text!templates/error.html',
    'jquery-ui',
    'jquery-ui.touch'],
    function($,
             _,
             Backbone,
             Models,
             moment,
             Utils,
             UserTemplate,
             GameListTemplate,
             GamesListItemTemplate,
             PreGameTemplate,
             PlayerListItemTemplate,
             InGameTemplate,
             PosGameTemplate,
             PlayerTokenTemplate,
             ErrorTemplate) {


        $(function(){

            //detalhes dessa implementação: http://stackoverflow.com/questions/152975/how-to-detect-a-click-outside-an-element
            $('html').click(function() {
                $('.token.selected').removeClass('selected');
            });

        });

        var UserView = Backbone.View.extend({

            initialize: function(){

                var that = this;

                _.bindAll(this);

                this.template = _.template(UserTemplate);

                var user = new Models.UserModel({online: basketball.online});

                if(basketball.online){
                    user.getUser({success: function(){

                        window.localStorage.setItem("user",user.get("email"));

                        that.model = user;
                        that.render();
                    }});
                }else{

                    user.set("email",window.localStorage.getItem("user"));

                    this.model = user;
                    this.render();
                }

            },

            events: {
                'click .logout': 'logout'
            },

            logout: function(){

                if(basketball.online){
                    localStorage.clear();
                    window.location = "/logout";
                }else{
                    if (confirm('Se você sair enquanto estiver no modo offline, todas as mudanças feitas serão perdidas e você só poderá usar o sistema novamente quando estiver conectado à internet! Tem certeza que deseja sair?')) {
                        localStorage.clear();
                        window.location = "/";
                    }
                }

            },

            render: function(){

                if(!this.model) return this;

                this.$el.html(this.template({user: this.model.toJSON()}));

                return this;
            }

        });

        var GamesList = Backbone.View.extend({

            id: 'gamelist',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(GameListTemplate);

                this.listenTo(this.collection,'add',function(model, collection){
                    this.$('#listContainer').prepend(new GamesListItem({model: model, collection: collection}).render().el);
                });

            },

            events: {
                'click .addGame': 'addGame'
            },

            addGame: function(){
                Backbone.history.navigate('/games/new_game', true);
            },

            render: function(){

                var that = this;

                this.$el.html(this.template());

                this.collection.sort();
                this.collection.each(function(game){
                    that.$('#listContainer').append(new GamesListItem({model: game, collection: that.collection}).render().el);
                });

                this.$("#contact_email").attr("href","mailto:" + "adrianocola" + "@" + "gmail" + ".com");

                return this;
            }
        });

        var GamesListItem = Backbone.View.extend({

            tagName: 'li',
            className: 'gameitem',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(GamesListItemTemplate);



                this.listenTo(this.model,'update',function(){
                    this.render();
                });

                this.listenTo(this.model,'delete',function(){
                    this.collection.remove(this.model);
                    this.remove();
                });

            },

            events: {
                'click .del': 'delete',
                'dblclick': 'details',
                'click .go': 'details'
            },

            details: function(){
                Backbone.history.navigate('/games/' + (this.model.get('sid') && this.model.get('sid')!='new'?this.model.get('sid'):this.model.id), true);
            },

            delete: function(){
                if(confirm("Tem certeza que deseja excluir?")){
                    this.model.destroy();
                    this.remove();
                }
            },

            render: function(){

                this.$el.html(this.template({game: this.model.toJSON(), moment: moment}));

                return this;
            }
        });

        var GameDetails = Backbone.View.extend({

            initialize: function(options){

                var that = this;

                _.bindAll(this);

                this.gameId = options.gameId;

                if(this.gameId === "new_game"){
                    this.model = this.collection.create({
                        name: "Novo Jogo",
                        date: Utils.now(),
                        updated_at: null,
                        mTeam:{},
                        oTeam: {},
                        mShots: {},
                        oShots: {},
                        opts: {}

                    });
                }else{
                    //teta buscar primeiro pelo ID externo, do DB
                    this.model = this.collection.getBySid(this.gameId);
                    //se não achar busca pelo ID interno
                    if(!this.model){
                        this.model = this.collection.get(this.gameId);
                    }

                }

                this.current_view = null;

            },

            render: function(where){

                //se ainda não foi salvo no server não exibe o jogo ainda
                if(basketball.online && this.model.get('sid') === "new"){
                    return this;
                }

                where = where || this.options.where;

                if(this.current_view){
                    this.current_view.remove();
                }

                switch(where){
                    case 1:
                        this.current_view = new PreGame({model: this.model, manager: this});
                        break;
                    case 2:
                        this.current_view = new InGame({model: this.model, manager: this});
                        break;
                    case 3:
                        this.current_view = new PosGame({model: this.model, manager: this});
                        break;
                    default:
                        this.current_view = new PreGame({model: this.model, manager: this});
                }

                this.$el.html(this.current_view.render().el);

                if(this.current_view.afterAdd){
                    setTimeout(this.current_view.afterAdd);
                }

                return this;
            }


        });

        var PreGame = Backbone.View.extend({

            id: 'pregame',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(PreGameTemplate);

                this.listenTo(this.model,'update',function(model){
                    this.render();
                });

            },

            events: {
                'click #top .title:not(.editing)': 'editTitle',
                'keyup #top .editTitle': 'updateTitle',
                'click #top .date:not(.editing)': 'editDate',
                'click .add': 'addPlayer',
                'click .buttons .in': 'gotoIn',
                'click .buttons .pos': 'gotoPos',
                'click .back': 'back'

            },

            back: function(){
                Backbone.history.navigate('/', true);
            },

            gotoIn: function(){
                this.options.manager.render(2);
            },

            gotoPos: function(){
                this.options.manager.render(3);
            },

            editTitle: function(){
                this.$('#top .title').html('- <input class="editTitle" value="' + this.model.get('name') + '"/>');

                this.$('#top .title').addClass('editing');
                this.$('#top .editTitle').focus().select();
            },

            updateTitle: function(evt){
                if(evt.keyCode == 13){
                    this.model.set('name',this.$('#top .editTitle').val());
                    this.$('#top .title').html('- ' + this.model.get('name'));

                    this.$('#top .title').removeClass('editing');

                    this.model.save();
                }else if(evt.keyCode == 27){
                    this.$('#top .title').html('- ' + this.model.get('name'));

                    this.$('#top .title').removeClass('editing');
                }

            },

            editDate: function(){

                var that = this;

                this.$('#top .date').html('<input class="editDate" value="' + moment(this.model.get('date')).format('DD/MM/YYYY') + '"/>');

                this.$('#top .date').addClass('editing');

                this.$('#top .editDate').datepicker({
                    onSelect: function(dateText, inst){
                        that.model.set('date',that.$('#top .editDate').datepicker( "getDate" ));
                        that.$('#top .date').html(moment(that.model.get('date')).format('DD/MM/YYYY'));

                        that.$('#top .editDate').datepicker('destroy');

                        that.$('#top .date').removeClass('editing');

                        that.model.save();
                    }
                }).datepicker( "show" );

            },

            addUtil: function(my){

                var playerView = new PlayerItem({model: {num: -1, name: '', position: 0}, pid: Utils.uniqueId()});
                this.listenTo(playerView,'edit',this.edited);
                this.listenTo(playerView,'remove',this.removed);
                this.$((my?'.playersContainerLeft':'.playersContainerRight') + ' .playerTable tbody').append(playerView.render().el);

            },

            addPlayer: function(evt){
                var element = this.$(evt.currentTarget);

                //verifica se está adicionado nos meus jogadores
                if(this.$('.playersContainerLeft').find(element).length){
                    this.addUtil(true);
                }else{
                    this.addUtil(false);
                }
            },

            edited: function(playerView){

                var teamStr = 'oTeam';

                //verifica se está adicionado nos meus jogadores
                if(this.$('.playersContainerLeft').find(playerView.$el).length){
                    teamStr = 'mTeam';
                }

                var players = this.model.get(teamStr);

                if(playerView.pid){
                    players[playerView.pid] = playerView.model;
                }else{
                    playerView.pid = Utils.uniqueId();
                    players[playerView.pid] = playerView.model;
                }


                this.model.set(teamStr,players);
                this.model.save();

            },

            removed: function(playerView){

                var that = this;

                var teamStr = 'oTeam';
                var shotsStr = 'oShots';

                //verifica se está adicionado nos meus jogadores
                if(this.$('.playersContainerLeft').find(playerView.$el).length){
                    teamStr = 'mTeam';
                    shotsStr = 'mShots';
                }

                var players = this.model.get(teamStr);
                var shots = this.model.get(shotsStr);

                var update = function(){
                    delete players[playerView.pid];
                    delete shots[playerView.pid];

                    that.model.set(teamStr,players);
                    that.model.set(shotsStr,shots);

                    that.model.save();

                    playerView.remove();
                }

                if(_.size(shots[playerView.pid])){
                    if(confirm('Jogador(a) possui jogadas. Deseja deletá-lo mesmo assim?')){
                        update();
                    }
                }else{
                    update();
                }

            },

            render: function(){

                var that = this;

                var game = this.model.toJSON();

                this.$el.html(this.template({game: game, moment: moment}));

                var views = [];

                _.each(game.mTeam,function(player, pid){
                    var playerView = new PlayerItem({model: player, pid: pid});
                    that.listenTo(playerView,'edit',that.edited);
                    that.listenTo(playerView,'remove',that.removed);

                    views.push(playerView);
                });

                views = views.sort(function(a, b) {return a.model.num - b.model.num});
                _.each(views, function(playerView){
                    that.$('.playersContainerLeft .playerTable tbody').append(playerView.render().el);
                });

                for(var i=_.size(game.mTeam);i<5;i++){
                    that.addUtil(true);
                };

                views = [];

                _.each(game.oTeam,function(player, pid){
                    var playerView = new PlayerItem({model: player, pid: pid});
                    that.listenTo(playerView,'edit',that.edited);
                    that.listenTo(playerView,'remove',that.removed);

                    views.push(playerView);
                });

                views = views.sort(function(a, b) {return a.model.num - b.model.num});
                _.each(views, function(playerView){
                    that.$('.playersContainerRight .playerTable tbody').append(playerView.render().el);
                });

                for(var i=_.size(game.oTeam);i<5;i++){
                    that.addUtil(false);
                };

                Backbone.history.navigate('/games/' + (this.model.get('sid') && this.model.get('sid')!='new'?this.model.get('sid'):this.model.id) + '/pre', false);

                return this;
            }


        });


        var PlayerItem = Backbone.View.extend({

            id: 'playeritem',
            tagName: 'tr',

            initialize: function(options){

                this.pid = options.pid;

                _.bindAll(this);

                this.template = _.template(PlayerListItemTemplate);
            },

            events: {
                'change .number select': 'update',
                'change .name input': 'update',
                'blur .name input': 'update',
                'change .position select': 'update',
                'click .del': 'delete'
            },

            update: function(evt){
                this.model.num = this.$('.number select').val();
                this.model.name = this.$('.name input').val();
                this.model.pos = this.$('.position select').val();
                this.render();

                this.trigger('edit',this);
            },

            delete: function(){
                this.trigger('remove',this);
            },

            render: function(){

                this.$el.html(this.template({player: this.model, edit: false, moment: moment}));

                this.$('.number select').val((this.model.num<10?'0':'') + parseInt(this.model.num));
                this.$('.position select').val(parseInt(this.model.pos));

                return this;
            }


        });


        var InGame = Backbone.View.extend({

            id: 'ingame',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(InGameTemplate);

                this.listenTo(this.model,'update',function(){
                    this.update();
                });
            },

            events: {
                'click .buttons .pre': 'gotoPre',
                'click .buttons .pos': 'gotoPos',
                'click .back': 'back',
                'change #checkHide': 'updateHide'

            },

            back: function(){
                Backbone.history.navigate('/', true);
            },

            gotoPre: function(){
                this.options.manager.render(1);
            },

            gotoPos: function(){
                this.options.manager.render(3);
            },

            updateHide: function(){
                var options = this.model.get('opts');
                options.hide = this.$('#checkHide').is(':checked');

                this.model.set('opts',options);
                this.model.save();
            },

            addedToken: function(event,ui){

                var pid = ui.draggable.attr('data-pid');
                var sid = ui.draggable.attr('data-sid');

                var my = ui.draggable.hasClass('my');

                var play = 'circle';
                if(ui.draggable.hasClass('token_square')){
                    play = 'square';
                }else if(ui.draggable.hasClass('token_circle')){
                    play = 'circle';
                }

                var player = my?this.model.get('mTeam')[pid]:this.model.get('oTeam')[pid];

                var shots = my?this.model.get('mShots'):this.model.get('oShots');
                var playerShots = shots[pid]?shots[pid]:{};

                var offset = this.$('#mid').offset();

                //console.log(ui.position.left + ":" + ui.position.top);
                //console.log(ui.offset.left + ":" + ui.offset.top);
                //console.log(offset.left + ":" + offset.top);

                //não é um shot, então preciso criar um shot
                if(!sid){

                    var x = ui.offset.left - offset.left;
                    var y = ui.offset.top - offset.top;

                    var shot = {date: Utils.now(), x: x, y: y, play: play};

                    var sid = Utils.uniqueId();

                    var playerView = new PlayerToken({model: this.model, player: player, pid: pid, shot: shot, sid: sid, my: my, drag: true});
                    playerView.$el.addClass(ui.draggable.attr('class'));

                    this.$('#mid').append(playerView.render().el);

                    playerView.$el.css({left: x, top: y});

                //token é um shot, então só é preciso atualizar sua posição
                }else{

                    var x = ui.position.left;
                    var y = ui.position.top;

                    var shot =  playerShots[sid];
                    shot.x = x;
                    shot.y = y;
                }

                //salva o shots
                playerShots[sid] = shot;

                shots[pid] = playerShots;

                my?this.model.set('mShots',shots):this.model.set('oShots',shots);

                this.model.save();

            },


            update: function(){


                //se mudou os times, atualiza tudo
                if(this.model.changedAttributes().mTeam || this.model.changedAttributes().oTeam){
                    this.render();
                    this.afterAdd();
                }else{

                    this.renderPlayersList();

                    var that = this;

                    var game = this.model.toJSON();

                    var newMShots = [];
                    var newOShots = [];

                    var mShotsMap = {};
                    var oShotsMap = {};

                    _.each(this.mShotsViews,function(shotView){

                        var player = game.mShots[shotView.options.pid];
                        if(player){
                            var shot = player[shotView.options.sid];
                            if(shot){
                                mShotsMap[shotView.options.pid + ':' + shotView.options.sid] = true;
                                if(shotView.$el.css('left')!= shot.x || shotView.$el.css('top')!= shot.y){
                                    shotView.$el.animate({left: shot.x, top: shot.y});
                                }
                                newMShots.push(shotView);
                            }else{
                                shotView.remove();
                            }
                        }else{
                            shotView.remove();
                        }

                    });

                    _.each(this.mViewsCircle,function(playerView,i){

                        var pid = playerView.options.pid;
                        var shots = game.mShots[pid];

                        _.each(shots, function(shot,sid){

                            if(!mShotsMap[pid + ':' + sid]){

                                var shotView = new PlayerToken({model: that.model, player: playerView.player, pid: pid, shot: shot, sid: sid, my: true, pos: i, drag: true});
                                newMShots.push(shotView);

                                that.$('#mid').append(shotView.render().el);

                                shotView.$el.css({left: shot.x, top: shot.y});

                                shotView.$el.addClass('animated bounceIn');
                                setTimeout(function(){
                                    shotView.$el.removeClass('animated bounceIn');
                                },1000);

                            }

                        });

                    })

                    this.mShotsViews = newMShots;


                    _.each(this.oShotsViews,function(shotView){

                        var player = game.oShots[shotView.options.pid];
                        if(player){
                            var shot = player[shotView.options.sid];
                            if(shot){
                                oShotsMap[shotView.options.pid + ':' + shotView.options.sid] = true;
                                if(shotView.$el.css('left')!= shot.x || shotView.$el.css('top')!= shot.y){
                                    shotView.$el.animate({left: shot.x, top: shot.y});
                                }
                                newOShots.push(shotView);
                            }else{
                                shotView.remove();
                            }
                        }else{
                            shotView.remove();
                        }

                    });

                    _.each(this.oViewsCircle,function(playerView,i){

                        var pid = playerView.options.pid;
                        var shots = game.oShots[pid];

                        _.each(shots, function(shot,sid){

                            if(!oShotsMap[pid + ':' + sid]){

                                var shotView = new PlayerToken({model: that.model, player: playerView.player, pid: pid, shot: shot, sid: sid, my: false, pos: that.oViews.length - i -1, drag: true});
                                newOShots.push(shotView);

                                that.$('#mid').append(shotView.render().el);

                                shotView.$el.css({left: shot.x, top: shot.y});

                                shotView.$el.addClass('animated bounceIn');
                                setTimeout(function(){
                                    shotView.$el.removeClass('animated bounceIn');
                                },1000);

                            }

                        });

                    })

                    this.oShotsViews = newOShots;

                }


                this.model.save({},{local: true});

            },

            render: function(){

                this.$el.html(this.template({game: this.model.toJSON(), moment: moment}));

                this.renderPlayersList();

                this.$('#mid').droppable({drop: this.addedToken});

                Backbone.history.navigate('/games/' + (this.model.get('sid') && this.model.get('sid')!='new'?this.model.get('sid'):this.model.id) + '/in', false);

                return this;
            },

            renderPlayersList: function(){

                var that = this;

                var game = this.model.toJSON();

                this.mViewsCircle = [];
                this.mViewsSquare = [];
                this.oViewsCircle = [];
                this.oViewsSquare = [];

                this.$('.team.mTeam .circle').html('');
                this.$('.team.mTeam .square').html('');
                this.$('.team.oTeam .circle').html('');
                this.$('.team.oTeam .square').html('');


                _.each(game.mTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, play: 'circle', my: true, drag: true});
                    that.mViewsCircle.push(playerView);
                });

                _.each(game.mTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, play: 'square', my: true, drag: true});
                    that.mViewsSquare.push(playerView);
                });

                //mostra a lista de jogadores de forma ordenada
                this.mViewsCircle = this.mViewsCircle.sort(function(a, b) {return a.player.num - b.player.num});
                _.each(this.mViewsCircle,function(playerView,i){
                    that.$('.team.mTeam .circle').append(playerView.render().el);
                    playerView.paint(i);
                });

                this.mViewsSquare = this.mViewsSquare.sort(function(a, b) {return a.player.num - b.player.num});
                _.each(this.mViewsSquare,function(playerView,i){
                    that.$('.team.mTeam .square').append(playerView.render().el);
                    playerView.paint(i);
                });

                _.each(game.oTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, play: 'circle', my: false, drag: true});
                    that.oViewsCircle.push(playerView);
                });

                _.each(game.oTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, play: 'square', my: false, drag: true});
                    that.oViewsSquare.push(playerView);
                });

                //mostra a lista de jogadores de forma ordenada
                this.oViewsCircle = this.oViewsCircle.sort(function(a, b) {return b.player.num - a.player.num});
                _.each(this.oViewsCircle,function(playerView,i){
                    that.$('.team.oTeam .circle').append(playerView.render().el);
                    playerView.paint(that.oViewsCircle.length-i-1);
                });

                //mostra a lista de jogadores de forma ordenada
                this.oViewsSquare = this.oViewsSquare.sort(function(a, b) {return b.player.num - a.player.num});
                _.each(this.oViewsSquare,function(playerView,i){
                    that.$('.team.oTeam .square').append(playerView.render().el);
                    playerView.paint(that.oViewsSquare.length-i-1);
                });

            },

            afterAdd: function(){

                var that = this;

                var game = this.model.toJSON();

                this.mShotsViews = [];
                this.oShotsViews = [];

                _.each(this.mViewsCircle,function(playerView,i){

                    var shots = game.mShots[playerView.options.pid];

                    _.each(shots,function(shot,sid){

                        var tokenView = new PlayerToken({model: that.model, player: playerView.player, pid: playerView.options.pid, shot: shot, sid: sid, my: true, pos: i, drag: true});
                        that.mShotsViews.push(tokenView);

                        that.$('#mid').append(tokenView.render().el);

                        tokenView.$el.css({left: shot.x, top: shot.y});

                    });
                });

                _.each(this.oViewsCircle,function(playerView,i){

                    var shots = game.oShots[playerView.options.pid];

                    _.each(shots,function(shot,sid){

                        var tokenView = new PlayerToken({model: that.model, player: playerView.player, pid: playerView.options.pid, shot: shot, sid: sid, my: false, pos: that.oViewsCircle.length-i-1, drag: true});
                        that.oShotsViews.push(tokenView);

                        that.$('#mid').append(tokenView.render().el);

                        tokenView.$el.css({left: shot.x, top: shot.y});

                    });
                });

            }

        });

        var PosGame = Backbone.View.extend({

            id: 'posgame',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(PosGameTemplate);
            },

            events: {
                'click .buttons .pre': 'gotoPre',
                'click .buttons .in': 'gotoIn',
                'click .back': 'back',
                'click .all': 'all',
                'change #checkSides': 'updateSides'

            },

            updateSides: function(){
                var options = this.model.get('opts');
                options.sides = this.$('#checkSides').is(':checked');

                this.showSides(options.sides);

                this.model.set('opts',options);
                this.model.save();
            },

            showSides: function(sides){


                _.each(this.mShotsViews,function(shotView){
                    shotView.showOnSide(sides,true);
                });

                _.each(this.oShotsViews,function(shotView){
                    shotView.showOnSide(sides,true);
                });


            },

            back: function(){
                Backbone.history.navigate('/', true);
            },

            gotoPre: function(){
                this.options.manager.render(1);
            },

            gotoIn: function(){
                this.options.manager.render(2);
            },

            all: function(evt){
                var that = this;

                var element = this.$(evt.currentTarget);

                var my = this.$('#top').find(element).length?true:false;
                var views = my?this.mViews:this.oViews;

                if(element.hasClass('selected')){

                    _.each(views, function(playerView){
                        playerView.setDisabled(true);
                        that.$(".shot." + (my?'my':'opp')).hide();
                    });

                    element.removeClass('selected');
                }else{

                    _.each(views, function(playerView){
                        playerView.setDisabled(false);
                        that.$(".shot." + (my?'my':'opp')).show();
                    });


                    element.addClass('selected');
                }

            },

            disabledPlayer: function(playerView){
                this.$(".shot[data-pid='" + playerView.options.pid + "']").hide();

                if(playerView.options.my){
                    this.$('#top .all').removeClass('selected');
                }else{
                    this.$('#bot .all').removeClass('selected');
                }
            },

            enablePlayer: function(playerView){
                this.$(".shot[data-pid='" + playerView.options.pid + "']").show();
            },

            render: function(){

                this.$el.html(this.template({game: this.model.toJSON(), moment: moment}));

                Backbone.history.navigate('/games/' + (this.model.get('sid') && this.model.get('sid')!='new'?this.model.get('sid'):this.model.id) + '/pos', false);

                return this;
            },

            afterAdd: function(){

                var that = this;

                var game = this.model.toJSON();

                this.mViews = [];
                this.oViews = [];

                this.mShotsViews = [];
                this.oShotsViews = [];

                _.each(game.mTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, my: true, canDisable: true, drag: false});

                    that.listenTo(playerView,'disabled',that.disabledPlayer);
                    that.listenTo(playerView,'enabled',that.enablePlayer);

                    that.mViews.push(playerView);
                });

                //mostra a lista de jogadores de forma ordenada
                this.mViews = this.mViews.sort(function(a, b) {return a.player.num - b.player.num});
                _.each(this.mViews,function(playerView,i){
                    that.$('.mTeam').append(playerView.render().el);
                    playerView.paint(i);

                    var shots = game.mShots[playerView.options.pid];

                    _.each(shots,function(shot,sid){

                        var tokenView = new PlayerToken({model: that.model, player: playerView.player, pid: playerView.options.pid, shot: shot, sid: sid, my: true, pos: i, drag: false});
                        that.mShotsViews.push(tokenView);

                        that.$('#mid').append(tokenView.render().el);

                        tokenView.$el.css({left: shot.x, top: shot.y});
                        tokenView.showOnSide(game.opts.sides);

                    });

                });

                _.each(game.oTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, my: false, canDisable: true, drag: false});

                    that.listenTo(playerView,'disabled',that.disabledPlayer);
                    that.listenTo(playerView,'enabled',that.enablePlayer);

                    that.oViews.push(playerView);
                });

                //mostra a lista de jogadores de forma ordenada
                this.oViews = this.oViews.sort(function(a, b) {return b.player.num - a.player.num});
                _.each(this.oViews,function(playerView,i){
                    that.$('.oTeam').append(playerView.render().el);
                    playerView.paint(that.oViews.length-i-1);

                    var shots = game.oShots[playerView.options.pid];

                    _.each(shots,function(shot,sid){

                        var tokenView = new PlayerToken({model: that.model, player: playerView.player, pid: playerView.options.pid, shot: shot, sid: sid, my: false, pos: that.oViews.length-i-1, drag: false});
                        that.oShotsViews.push(tokenView);

                        that.$('#mid').append(tokenView.render().el);

                        tokenView.$el.css({left: shot.x, top: shot.y});
                        tokenView.showOnSide(game.opts.sides);

                    });

                });

            }

        });

        var PlayerToken = Backbone.View.extend({

            className: 'token',

            initialize: function(options){

                this.player = options.player;
                this.shot = options.shot;

                _.bindAll(this);

                this.template = _.template(PlayerTokenTemplate);
            },

            events: {
                'click .del': 'delete',
                'click': 'toggle'
            },

            setDisabled: function(disabled){
                this.disabled = disabled;
                if(this.disabled){
                    this.$el.addClass('disabled');
                }else{
                    this.$el.removeClass('disabled');
                }

            },

            toggle: function(evt){
                evt.stopPropagation();

                if(!this.shot && this.options.canDisable){
                    if(this.disabled){
                        this.$el.removeClass('disabled');
                        this.trigger('enabled',this);
                    }else{
                        this.$el.addClass('disabled');
                        this.trigger('disabled',this);
                    }
                    this.disabled = !this.disabled;
                }else if(this.shot){
                    $('.token.selected').removeClass('selected');
                    this.$el.addClass('selected');
                }

            },

            showOnSide: function(side,animate){

                if(!this.shot) return;

                if(side){
                    if(this.options.my){
                        if(this.shot.x > 460){
                            this.$el[animate?"animate":"css"]({left: this.shot.x-2*(this.shot.x-460) +8, top: 518 - this.shot.y - 32},1000);
                        }
                    }else{
                        if(this.shot.x < 460){
                            this.$el[animate?"animate":"css"]({left: 460 + (460-this.shot.x) + 8, top: 518 - this.shot.y - 32},1000);
                        }
                    }
                }else{
                    this.$el[animate?"animate":"css"]({left: this.shot.x, top: this.shot.y},1000);
                }

            },

            remove: function(){

                this.$el.addClass('animated bounceOut');
                setTimeout(this.$el.remove,1000);

            },

            delete: function(){
                var that = this;

                if(this.shot){
                    var allShots = this.options.my?this.model.get('mShots'):this.model.get('oShots');

                    var playerShots = allShots[this.options.pid];

                    delete playerShots[this.options.sid];

                    allShots[this.options.pid] = playerShots;

                    this.options.my?this.model.set('mShots',allShots):this.model.set('oShots',allShots);

                    this.remove();

                    this.model.save();
                }
            },

            paint: function(pos){

                this.options.pos = (pos%12);

                this.$el.addClass('color'+this.options.pos);
            },

            render: function(){

                this.$el.html(this.template({player: this.player, my: this.options.my, moment: moment}));

                if(this.options.my){
                    this.$el.addClass('my');
                }else{
                    this.$el.addClass('opp');
                }

                if(!this.shot){
                    if(this.options.play==="square"){
                        this.$el.addClass('token_square');
                    }else if(this.options.play==="circle"){
                        this.$el.addClass('token_circle');
                    }else{
                        this.$el.addClass('token_circle');
                    }
                }else{
                    if(this.shot.play==="square"){
                        this.$el.addClass('token_square');
                    }else if(this.shot.play==="circle"){
                        this.$el.addClass('token_circle');
                    }else{
                        this.$el.addClass('token_circle');
                    }
                }

                if(this.options.pid){
                    this.$el.attr('data-pid',this.options.pid);
                }

                if(this.options.sid){
                    this.$el.attr('data-sid',this.options.sid);
                    this.$el.addClass('shot');
                    //se tem sid (shot id) tem que ser com posicionamento absoluto
                    this.$el.css('position','absolute');
                }else{
                    this.$el.addClass('player');
                }

                if(this.options.drag){
                    this.$el.draggable({ revert: this.shot?false:true, containment: this.shot?"parent":undefined });
                }

                if(this.options.pos != undefined){
                    this.paint(this.options.pos);
                }


                return this;
            }

        });


        var ErrorView = Backbone.View.extend({

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(ErrorTemplate);
            },

            events: {
                'click #commonErrorHome': 'gotoHome',
                'click #commonErrorRefresh': 'refreshPage'
            },

            gotoHome: function(){
                window.location.href = '/';
            },

            refreshPage: function(){
                window.location.reload(true);
            },

            render: function(){

                this.$el.html(this.template({options: this.options}));

                $('body').append(this.el);

                return this;
            }


        });


        return {
            UserView: UserView,
            GamesList: GamesList,
            GameDetails: GameDetails,
            PreGame: PreGame,
            ErrorView: ErrorView
        };
    }
);
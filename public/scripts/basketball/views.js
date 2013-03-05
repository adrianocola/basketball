
define(['jquery',
    'underscore',
    'backbone',
    'Models',
    'moment',
    'Utils',
    'text!templates/games_list.html',
    'text!templates/games_list_item.html',
    'text!templates/pre_game.html',
    'text!templates/player_list_item.html',
    'text!templates/in_game.html',
    'text!templates/pos_game.html',
    'text!templates/player_token.html',
    'text!templates/error.html',
    'jquery-ui',
    'jquery.inputmask',
    'jquery.inputmask.date'],
    function($,
             _,
             Backbone,
             Models,
             moment,
             Utils,
             GameListTemplate,
             GamesListItemTemplate,
             PreGameTemplate,
             PlayerListItemTemplate,
             InGameTemplate,
             PosGameTemplate,
             PlayerTokenTemplate,
             ErrorTemplate) {

        var GamesList = Backbone.View.extend({

            id: 'gamelist',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(GameListTemplate);

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

                this.collection.each(function(game){
                    that.$('#listContainer').append(new GamesListItem({model: game, collection: that.collection}).render().el);
                });

                return this;
            }
        });

        var GamesListItem = Backbone.View.extend({

            tagName: 'li',
            className: 'gameitem',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(GamesListItemTemplate);

            },

            events: {
                'click .del': 'delete',
                'dblclick': 'details'
            },

            details: function(){
                Backbone.history.navigate('/games/' + this.model.id, true);
            },

            delete: function(){
                this.model.destroy();
                this.remove();
            },

            render: function(){

                this.$el.html(this.template({game: this.model.toJSON(), moment: moment}));

                return this;
            }
        });

        var GameDetails = Backbone.View.extend({

            initialize: function(options){

                _.bindAll(this);

                this.gameId = options.gameId;

                if(this.gameId === "new_game"){
                    this.model = this.collection.create();
                }else{
                    this.model = this.collection.get(this.gameId);
                    //fazer fetch (do local storage ou do server, sei lá)
                }
            },

            render: function(where){

                where = where || this.options.where;

                var view;

                switch(where){
                    case 1:
                        view = new PreGame({model: this.model, manager: this});
                        break;
                    case 2:
                        view = new InGame({model: this.model, manager: this});
                        break;
                    case 3:
                        view = new PosGame({model: this.model, manager: this});
                        break;
                    default:
                        view = new PreGame({model: this.model, manager: this});
                }

                this.$el.html(view.render().el);

                if(view.afterAdd){
                    setTimeout(view.afterAdd);
                }

                return this;
            }


        });

        var PreGame = Backbone.View.extend({

            id: 'pregame',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(PreGameTemplate);
                this.playerTemplate = _.template(PlayerListItemTemplate);
            },

            events: {
                'dblclick #top .title': 'editTitle',
                'keyup #top .editTitle': 'updateTitle',
                'dblclick #top .date': 'editDate',
                'click .add': 'addPlayer',
                'click .back': 'back',
                'click .buttons .in': 'gotoIn',
                'click .buttons .pos': 'gotoPos'

            },

            gotoIn: function(){
                this.options.manager.render(2);
            },

            gotoPos: function(){
                this.options.manager.render(3);
            },

            editTitle: function(){
                this.$('#top .title').html('- <input class="editTitle" value="' + this.model.get('name') + '"/>');
            },

            updateTitle: function(evt){
                if(evt.keyCode == 13){
                    this.model.set('name',this.$('#top .editTitle').val());
                    this.$('#top .title').html('- ' + this.model.get('name'));

                    this.save();
                }else if(evt.keyCode == 27){
                    this.$('#top .title').html('- ' + this.model.get('name'));
                }

            },

            editDate: function(){

                var that = this;

                this.$('#top .date').html('<input class="editDate" value="' + moment(this.model.get('date')).format('DD/MM/YYYY') + '"/>');

                this.$('#top .editDate').datepicker({
                    onSelect: function(dateText, inst){
                        that.model.set('date',that.$('#top .editDate').datepicker( "getDate" ));
                        that.$('#top .date').html(moment(that.model.get('date')).format('DD/MM/YYYY'));

                        that.$('#top .editDate').datepicker('destroy');

                        that.save();
                    }
                }).datepicker( "show" );

            },

            back: function(){
                Backbone.history.navigate('/', true);
            },

            addPlayer: function(evt){
                var element = this.$(evt.currentTarget);

                //verifica se está adicionado nos meus jogadores
                if(this.$('.playersContainerLeft').find(element).length){
                    var playerView = new PlayerItem({model: {id: Utils.uniqueId(), num: 0, name: '', position: 0}});
                    playerView.on('edit',this.edited);
                    playerView.on('remove',this.removed);
                    this.$('.playersContainerLeft .playerTable tbody').append(playerView.render().el);
                }else{
                    var playerView = new PlayerItem({model: {id: Utils.uniqueId(), num: 0, name: '', position: 0}});
                    playerView.on('edit',this.edited);
                    playerView.on('remove',this.removed);
                    this.$('.playersContainerRight .playerTable tbody').append(playerView.render().el);
                }
            },

            edited: function(playerView){

                var teamStr = 'oTeam';

                //verifica se está adicionado nos meus jogadores
                if(this.$('.playersContainerLeft').find(playerView.$el).length){
                    teamStr = 'mTeam';
                }

                var players = this.model.get(teamStr);

                players[playerView.model.id] = playerView.model;

                this.model.set(teamStr,players);
                this.save();

            },

            removed: function(playerView){

                var teamStr = 'oTeam';

                //verifica se está adicionado nos meus jogadores
                if(this.$('.playersContainerLeft').find(playerView.$el).length){
                    teamStr = 'mTeam';
                }

                var players = this.model.get(teamStr);

                delete players[playerView.model.id];

                this.model.set(teamStr,players);

                this.save();


            },

            save: function(){

                this.model.save();

            },

            render: function(){

                var that = this;

                var game = this.model.toJSON();

                this.$el.html(this.template({game: game, moment: moment}));

                _.each(game.mTeam,function(player){
                    var playerView = new PlayerItem({model: player});
                    playerView.on('edit',that.edited);
                    playerView.on('remove',that.removed);
                    that.$('.playersContainerLeft .playerTable tbody').append(playerView.render().el);
                });

                _.each(game.oTeam,function(player){
                    var playerView = new PlayerItem({model: player});
                    playerView.on('edit',that.edited);
                    playerView.on('remove',that.removed);
                    that.$('.playersContainerRight .playerTable tbody').append(playerView.render().el);
                });

                Backbone.history.navigate('/games/' + this.model.id + '/pre', false);

                return this;
            }


        });


        var PlayerItem = Backbone.View.extend({

            id: 'playeritem',
            tagName: 'tr',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(PlayerListItemTemplate);
            },

            events: {
                'keyup .numberEdit': 'update',
                'keyup .nameEdit': 'update',
                'keyup .positionEdit': 'update',
                'click .del': 'delete',
                'dblclick': 'edit'
            },

            edit: function(){
                this.$el.html(this.template({player: this.model, edit: true, moment: moment}));
            },

            update: function(evt){
                if(evt.keyCode == 13){
                    this.model.num = this.$('.numberEdit').val();
                    this.model.name = this.$('.nameEdit').val();
                    this.model.pos = this.$('.positionEdit').val();
                    this.render();

                    this.trigger('edit',this);
                }else if(evt.keyCode == 27){
                    if(!this.model.num && !this.model.name && !this.model.pos){
                        this.delete();
                    }else{
                        this.render();
                    }
                }
            },

            delete: function(){
                this.trigger('remove',this);

                this.remove();

            },

            render: function(){

                this.$el.html(this.template({player: this.model, edit: false, moment: moment}));

                return this;
            }


        });


        var InGame = Backbone.View.extend({

            id: 'ingame',

            initialize: function(){

                _.bindAll(this);

                this.template = _.template(InGameTemplate);
            },

            events: {
                'click .buttons .pre': 'gotoPre',
                'click .buttons .pos': 'gotoPos'

            },

            gotoPre: function(){
                this.options.manager.render(1);
            },

            gotoPos: function(){
                this.options.manager.render(3);
            },

            addedToken: function(event,ui){

                var pid = ui.draggable.attr('data-pid');
                var sid = ui.draggable.attr('data-sid');

                var my = ui.draggable.hasClass('my');

                var player = my?this.model.get('mTeam')[pid]:this.model.get('oTeam')[pid];

                var shots = my?this.model.get('mShots'):this.model.get('oShots');
                var playerShots = shots[pid]?shots[pid]:{};

                var offset = this.$('#mid').offset();

                //console.log(ui.position.left + ":" + ui.position.top);
                //console.log(ui.offset.left + ":" + ui.offset.top);
                //console.log(offset.left + ":" + offset.top);

                //é um shot
                if(!sid){

                    var x = ui.offset.left - offset.left;
                    var y = ui.offset.top - offset.top;

                    var shot = {date: Utils.now(), x: x, y: y};

                    var sid = Utils.uniqueId();

                    var playerView = new PlayerToken({model: this.model, player: player, pid: pid, shot: shot, sid: sid, my: my, drag: true});

                    this.$('#mid').append(playerView.render().el);

                    playerView.$el.css({left: x, top: y + offset.top});

                //token é um shot, então só é preciso atualizar sua posição
                }else{
                    var x = ui.position.left;
                    var y = ui.position.top - offset.top;

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

            render: function(){

                this.$el.html(this.template({game: this.model.toJSON(), moment: moment}));

                this.$('#mid').droppable({drop: this.addedToken});

                Backbone.history.navigate('/games/' + this.model.id + '/in', false);

                return this;
            },

            afterAdd: function(){

            var that = this;

            var game = this.model.toJSON();
            var offset = this.$('#mid').offset();

            _.each(game.mTeam,function(player,key){
                var playerView = new PlayerToken({model: that.model, player: player, pid: key, my: true, drag: true});
                that.$('.mTeam').append(playerView.render().el);

                var shots = game.mShots[key];

                _.each(shots,function(shot,sid){

                    var tokenView = new PlayerToken({model: that.model, player: player, shot: shot, pid: key, sid: sid, my: true, drag: true});

                    that.$('#mid').append(tokenView.render().el);

                    tokenView.$el.css({left: shot.x, top: shot.y + offset.top});

                });

            });

            _.each(game.oTeam,function(player,key){
                var playerView = new PlayerToken({model: that.model, player: player, pid: key, my: false, drag: true});
                that.$('.oTeam').append(playerView.render().el);

                var shots = game.oShots[key];

                _.each(shots,function(shot,sid){

                    var tokenView = new PlayerToken({model: that.model, player: player, shot: shot, pid: key, sid: sid, my: false, drag: true});

                    that.$('#mid').append(tokenView.render().el);

                    tokenView.$el.css({left: shot.x, top: shot.y + offset.top});

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
                'click .buttons .in': 'gotoIn'

            },

            gotoPre: function(){
                this.options.manager.render(1);
            },

            gotoIn: function(){
                this.options.manager.render(2);
            },

            render: function(){

                this.$el.html(this.template({game: this.model.toJSON(), moment: moment}));

                Backbone.history.navigate('/games/' + this.model.id + '/pos', false);

                return this;
            },

            afterAdd: function(){

                var that = this;

                var game = this.model.toJSON();
                var offset = this.$('#mid').offset();

                _.each(game.mTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, my: true, drag: false});
                    that.$('.mTeam').append(playerView.render().el);

                    var shots = game.mShots[key];

                    _.each(shots,function(shot,sid){

                        var tokenView = new PlayerToken({model: that.model, player: player, pid: key, my: true, drag: false});

                        that.$('#mid').append(tokenView.render().el);

                        tokenView.$el.css({left: shot.x, top: shot.y + offset.top});

                    });

                });

                _.each(game.oTeam,function(player,key){
                    var playerView = new PlayerToken({model: that.model, player: player, pid: key, sid: sid, my: false, drag: false});
                    that.$('.oTeam').append(playerView.render().el);

                    var shots = game.oShots[key];

                    _.each(shots,function(shot,sid){

                        var tokenView = new PlayerToken({model: that.model, player: player, pid: key, sid: sid, my: false, drag: false});

                        that.$('#mid').append(tokenView.render().el);

                        tokenView.$el.css({left: shot.x, top: shot.y + offset.top});

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
                'click .del': 'delete'
            },

            delete: function(){
                var that = this;

                if(this.shot){
                    var allShots = this.options.my?this.model.get('mShots'):this.model.get('oShots');

                    var playerShots = allShots[this.options.pid];

                    delete playerShots[this.options.sid];

                    allShots[this.options.pid] = playerShots;

                    this.options.my?this.model.set('mShots',allShots):this.model.set('oShots',allShots);


                    this.$el.addClass('animated bounceOut');
                    setTimeout(this.remove,1000);

                    this.model.save();
                }
            },

            render: function(){

                this.$el.html(this.template({player: this.player, my: this.options.my, moment: moment}));

                if(this.options.my){
                    this.$el.addClass('my');
                }else{
                    this.$el.addClass('opp');
                }

                if(this.options.pid){
                    this.$el.attr('data-pid',this.options.pid);
                }

                if(this.options.sid){
                    this.$el.attr('data-sid',this.options.sid);
                    //se tem sid (shot id) tem que ser com posicionamento absoluto
                    this.$el.css('position','absolute');
                }

                if(this.options.drag){
                    this.$el.draggable({ revert: this.shot?false:true, containment: this.shot?"parent":undefined });
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
                console.log('home');
                window.location.href = '/';
            },

            refreshPage: function(){
                console.log('refresh');
                window.location.reload(true);
            },

            render: function(){

                this.$el.html(this.template({options: this.options}));

                $('body').append(this.el);

                return this;
            }


        });


        return {
            GamesList: GamesList,
            GameDetails: GameDetails,
            PreGame: PreGame,
            ErrorView: ErrorView
        };
    }
);
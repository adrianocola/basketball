define([
    'jquery',
    'underscore',
    'backbone',
    'Utils',
    'Models',
    'Views'
], function($,
            _,
            Backbone,
            Utils,
            Models,
            Views){

    //configura backbone para algumas customizações
    Utils.setupBackbone();


    var storeId;


    var AppRouter = Backbone.Router.extend({

        html_main: "#main",

        initialize: function(collection){

            this.collection = collection;

        },

        routes: {
            'config': 'showConfig',
            'games/:game': 'showGame',
            'games/:game/pre': 'showPreGame',
            'games/:game/in': 'showInGame',
            'games/:game/pos': 'showPosGame',
            '*actions': 'defaultAction'
        },
        showConfig: function(gameId){
            this.showView(this.html_main,new Views.ConfigView({gameId: gameId, collection: this.collection}));
        },
        showGame: function(gameId){
            this.showView(this.html_main,new Views.GameDetails({gameId: gameId, collection: this.collection}));
        },
        showPreGame: function(gameId){
            this.showView(this.html_main,new Views.GameDetails({gameId: gameId, where: 1, collection: this.collection}));
        },
        showInGame: function(gameId){
            this.showView(this.html_main,new Views.GameDetails({gameId: gameId, where: 2, collection: this.collection}));
        },
        showPosGame: function(gameId){
            this.showView(this.html_main,new Views.GameDetails({gameId: gameId, where: 3, collection: this.collection}));
        },
        defaultAction: function(actions){
            this.showView(this.html_main,new Views.GamesList({collection: this.collection}));
        },

        removeCurrentView: function(force){
            var that = this;
            var closeCallback = function(){
                that.removeCurrentView(true);
            }

            //verifica se close permitiu fazer a troca de view (se for false, não permitiu)
            if (this.currentView && this.currentView.close(force?null:closeCallback)===false){
                return false;
            }


            this.currentView = null;
            return true;
        },

        showView: function(selector, view, force) {

            //se tiver alguma view tenta removê-la
            if(this.currentView){
                var that = this;
                var closeCallback = function(){
                    that.showView(selector,view,true);
                }
                //verifica se close permitiu fazer a troca de view (se for false, não permitiu)
                if (this.currentView.close(force?null:closeCallback)===false){
                    return;
                }
            }

            $(selector).html(view.render().el);
            //avisa view que ela foi adicionada na DOM
            view.afterAdd();
            this.currentView = view;
            return view;
        }
    });

    var initialize = function(){

        if(basketball.online){
            console.log('Executando em modo ONLINE');
        }else{
            console.log('Executando em modo OFFLINE');
            basketball.online = false;
            basketball.offline = true;
        }

        if(basketball.online ){
            basketball.socket = io.connect();
        }


        var collection = new Models.GameCollection();

        var init = false;

        window.collection = collection;

        collection.fetch({local: basketball.offline, success: function(col,resp){

            if(init) return;

            init = true;

            var initialize = function(){
                if(start) return;
                start = true;
                var app_router = new AppRouter(collection);

                //inicializa controle de histórico (verifica se pode usar push state)
                Utils.startHistory(app_router);
            }

            if(basketball.online){
                var start = false;
                collection.once('pull',initialize);
                collection.once('reset',initialize);
            }else{
                initialize();
            }

        }});




    };
    return {
        initialize: initialize
    };
});
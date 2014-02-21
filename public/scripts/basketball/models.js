
define(['jquery',
    'underscore',
    'backbone',
    'backbone.offline',
    'Utils'], function($,
                             _,
                             Backbone,
                             Offline,
                             Utils) {

    var UserModel = Backbone.Model.extend({

        idAttribute: '_id',

        url: '/api/user/data',

        initialize: function(){

            _.bindAll(this);

        },

        logout: function(options){
            $.ajax('/api/user/logout',options);
        },

        getUser: function(options){

            var that = this;

            var success = options.success;
            var error = options.error;

            options.success = function(data,text,xhr){

                that.set(data,{silent: true});

                if(success){
                    success(that,data,options);
                }
            }

            options.error = function(xhr,text,error){

                if(error){
                    success(that,xhr,options);
                }

            }

            $.ajax('/api/user/data',options);

        }

    });

    var GameModel = Backbone.Model.extend({

        urlRoot: '/api/games',

        initialize: function(){

            var model = this;

            _.bindAll(this);

            if(basketball.online){

                //se já veio do server, registra para receber mudanças
                if(this.get('sid')){
                    this.registerUpdate();
                //se está sendo criado agora espera voltar do server para pegar um ID e assim esperar mudanças
                }else{
                    this.collection.once('sync',this.registerUpdate);
                }
            }

        },

        registerUpdate: function(){
            var model = this;

            basketball.socket.on('game_delete:' + model.get('sid'), function(game){
                model.trigger('delete');
            });

            basketball.socket.on('game_change:' + model.get('sid'), function(game){
                //verifica se é outra versão (compara as datas de modificação)
                if(game.updated_at > model.get('updated_at')){

                    model.set('sid',game.id);
                    model.set('dirty',false);
                    delete game.id;
                    model.set(game);


                    model.trigger('update');
                }
            });
        },

        defaults: {
            name: "Novo Jogo",
            date: Utils.now(),
            updated_at: undefined,
            mTeam:{ //meu time
                //id: {num: 1, name: 'teste', pos: 1}
            },
            oTeam: {//time do oponente
                //id: {num: 1, name: 'teste', pos: 1}
            },
            mShots: {
                //'player_id': { date: {date: now(), x: 123, y: 123, play: 'circle'}  }
            },
            oShots: {

            },
            opts: {}

        }

    });

    var GameCollection = Backbone.Collection.extend({

        model: GameModel,

        url: '/api/games',

        initialize: function(){

            var collection = this;

            this.storage = new Offline.Storage('games', this, {autoPush: basketball.online?true:false});

            if(basketball.online){
                basketball.socket.on('new_game', function(game){

                    var isSource = false;

                    collection.each(function(_game){
                        if(game.id === _game.get('sid') || game.updated_at == _game.get('updated_at')){
                            isSource = true;
                        }
                    });

                    if(!isSource){
                        var model = collection.create({}, {local: true});

                        model.set('sid',game.id);
                        model.set('dirty',false);
                        delete game.id;
                        model.set(game);

                        model.save({},{local: true});

                        model.registerUpdate();
                    }
                });
            }


        },

        getBySid: function(sid){

            var m;

            this.each(function(model){
                if(model.get('sid')===sid){
                    m = model;
                }
            });

            return m;
        },

        comparator: function(model) {
            return -new Date(model.get("date")).getTime();
        }


    });


    var exports = {};

    exports.UserModel = UserModel;
    exports.GameModel = GameModel;
    exports.GameCollection = GameCollection;

    return exports;


});
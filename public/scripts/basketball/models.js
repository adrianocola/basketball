
define(['jquery',
    'underscore',
    'backbone',
    'backbone.offline',
    'Utils'], function($,
                             _,
                             Backbone,
                             Offline,
                             Utils) {

    var GameModel = Backbone.Model.extend({

        urlRoot: '/api/games',

        initialize: function(){

            _.bindAll(this);

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
                //'player_id': { id: {date: now(), x: 123, y: 123}  }
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

            this.storage = new Offline.Storage('games', this, {autoPush: basketball.online?true:false});

        },

        comparator: function(model) {
            return -new Date(model.get("date")).getTime();
        }


    });


    var exports = {};

    exports.GameModel = GameModel;
    exports.GameCollection = GameCollection;

    return exports;


});
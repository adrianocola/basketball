var app = require(__dir +  '/app'),
    mongoose = require('mongoose'),
    util = require("util"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var GameSchema = new Schema({
    user:{ type: Schema.ObjectId, ref: 'User', required: true, index: true},
    name: String,
    date: Date,
    updated_at: Date,
    mTeam:{},
    oTeam: {},
    mShots: {},
    oShots: {},
    opts: {}

},{ strict: true });


var UserSchema = new Schema({
    email: {type: String, lowercase: true, index: { unique: true, sparse: true }},
    password: {type: String, required: true},
    last_login: Date
},{ strict: true });

var Game = exports.Game = mongoose.model('Game', GameSchema);
var User = exports.User = mongoose.model('User',UserSchema);


var small_control = "disconnected";


var conect_mongodb = function(){

    mongoose.connect(app.env.mongo_url,{
        server: { socketOptions: { keepAlive: 1 } },
        replset: { socketOptions: { keepAlive: 1 } }
    });

    mongoose.connection.on('error', function(error) {
        console.log('Erro na conexão com o MongoDB: ' + error);
        mongoose.disconnect();
    });

}



mongoose.connection.on('connected', function() {
    console.log('Conectado ao MongoDB!');

    small_control = "connected";

});

mongoose.connection.on('disconnected', function() {

    if(small_control != "disconnected"){
        console.log('Desconectado do MongoDB!');
    }

    small_control = "disconnected";

    setTimeout(conect_mongodb,5000);
});




conect_mongodb();
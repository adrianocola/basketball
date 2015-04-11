//TODO Deixar a parte de authorization mais segura (cookie)

__dir = __dirname;

var express = require('express');
var _ = require('lodash');
var app = module.exports = express();

var methodOverride = require('method-override');
var session = require('express-session');
var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var stylus = require('stylus');
var nib = require('nib');
var requirejs = require('requirejs');
var consts = app.consts = require('./conf/consts');
var env = app.env = require('./conf/env');
var errors = app.errors = require('./conf/errors');
var utils = app.utils = require('./lib/utils');
var io = require('socket.io');
var md5 = app.md5 = require('./lib/md5');
var uniqueId = app.uniqueId = require('./lib/uniqueId');
var models = app.models = require('./models/models');
var redis = app.redis = require('redis-url').connect(process.env.REDISCLOUD_URL || undefined);
var RedisStore = require('connect-redis')(session);

uniqueId.seed(process.pid);


function errorsHandler(err, req, res, next){
    if (err instanceof app.errors.ExpectedError) {
        console.log("EXPECTED ERROR: " + err.code + " - " + err.error);
        res.json(400,{code: err.code, error: err.error});
    }else if (err instanceof app.errors.UnexpectedError) {
        console.log("UNEXPECTED ERROR: " + err.error);
        console.log(err.stack);
        res.json(500,{code: -1, error: "Unexpected Error: " + err.error});
    } else {
        next(err);
    }
}

function compile_nib(str, path) {
    return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
}

console.log();

if(app.get('env')==="development"){
    app.use(express.logger('dev'));
}

app.set('port', process.env.PORT || 4595);
app.set('views',__dirname + '/views');
app.set('view engine', 'jade');
app.use(stylus.middleware({ src: __dirname + '/public', compile: compile_nib}));
app.use(express.static(__dirname + '/public'));
app.use(express.compress());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true },{ maxAge: 604800000 }));
app.use(methodOverride());
app.use(express.cookieParser());

app.use(express.session({ cookie: { maxAge: 30672000000}, store: new RedisStore({
    client: redis
}), secret: 'basquetesecret'})); //sessão de 1 ano

app.use(app.router);
app.use(errorsHandler);

if(app.get('env')==="development"){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}else{
    app.use(express.errorHandler());
}

[   'user','index'
].forEach(function(route) {
        require('./routes/' + route);
    });


var server = http.createServer(app);

app.io = io(server);

server.listen(app.get('port'));

console.log("Ouvindo na porta %d em modo %s", app.get('port'), app.get('env'));


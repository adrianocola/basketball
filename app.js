//TODO Deixar a parte de authorization mais segura (cookie)

__dir = __dirname;

var deps = require('./deps');

var express = require('express');
var u = require('underscore');
var app = module.exports = express();

u.extend(app, deps);

var http = require('http');
var fs = require('fs');
var stylus = require('stylus');
var nib = require('nib');
var requirejs = require('requirejs');


function errorsHandler(err, req, res, next){
    if (err instanceof deps.errors.ExpectedError) {
        console.log("EXPECTED ERROR: " + err.code + " - " + err.error);
        res.json(400,{code: err.code, error: err.error});
    }else if (err instanceof deps.errors.UnexpectedError) {
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



app.configure(function(){
    if(app.env.development){
        app.use(express.logger('dev'));
    }
    app.set('views',__dirname + '/views');
    app.set('view engine', 'jade');
    app.use(stylus.middleware({ src: __dirname + '/public', compile: compile_nib}));
    app.use(express.static(__dirname + '/public'));
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

});

app.configure('development', function(){

    app.use(app.router);
    app.use(errorsHandler);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});

app.configure('production', function(){

    app.use(app.router);
    app.use(errorsHandler);
    app.use(express.errorHandler());

});


[   'index'
].forEach(function(route) {
        require('./routes/' + route);
    });


var server = http.createServer(app).listen(app.env.port);


var io = app.io = require('socket.io').listen(server);
//configuração para não usar WebSockets (não suportado ainda pelo Heroku)
io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.set('log level', 1);
    io.set('browser client cache', true);
    io.set('browser client minification', true);
    io.set('browser client gzip', true);
});

io.sockets.on('connection', function (socket) {

    //console.log("connect");

    socket.on('disconnect', function () {
        //console.log("disconnect");
    });
});

console.log("(%s) Express server listening on port %d in %s mode", deps.version, app.env.port, app.env.type_str);

setInterval(function(){
    console.log('ping');
},600000);

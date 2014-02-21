var app = require(__dirname + '/../app'),
    u = require('underscore');

var utils = {};


utils.verifyAuthorization = function(req, res, next){

    //if have authorization, player is authenticated
    if(!req.session.userId){
        res.json(401,"Sessão expirada!");
        return;
    }

    next();

};

utils.verifyAuthorizationPage = function(req, res, next){

    //if have authorization, player is authenticated
    if(!req.session || !req.session.userId){
        res.render('login',{session: req.session});
        return;
    }

    next();

};

utils.void = function(){}

module.exports = utils;
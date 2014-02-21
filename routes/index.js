var app = require('../app')
    ,  fs = require('fs')
    ,  u = require('underscore');


app.get('/api/games', app.utils.verifyAuthorization, function(req, res, next){

    app.models.Game.find({user: req.session.userId}, function(err,games){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        u.each(games,function(game){
            game._doc.id = game._doc._id;
            delete game._doc._id;
        });

        res.json(games);

    });


});

app.post('/api/games', app.utils.verifyAuthorization, function(req, res, next){

    var game = new app.models.Game(req.body);
    game.user = req.session.userId;

    game.save(function(err){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        game._doc.id = game._doc._id;
        delete game._doc._id;

        res.json(game);

        app.io.sockets.emit('new_game',game);

    });

});

app.put('/api/games/:id', app.utils.verifyAuthorization, function(req, res, next){


    app.models.Game.findOneAndUpdate({_id: req.params.id, user: req.session.userId},{$set: req.body},function(err,game){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        game._doc.id = game._doc._id;
        delete game._doc._id;

        res.json(game);

        app.io.sockets.emit('game_change:' + game._doc.id,game);

    });


});

app.delete('/api/games/:id', app.utils.verifyAuthorization, function(req, res, next){


    app.models.Game.findOne({_id: req.params.id, user: req.session.userId},function(err,game){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        if(game){
            game.remove(function(err){

                if(err){ next(new app.errors.UnexpectedError(err)); return; }

                game._doc.id = game._doc._id;
                delete game._doc._id;

                res.json(game);

                app.io.sockets.emit('game_delete:' + game._doc.id,game);


            });
        }else{
            res.json(false);
        }

    });


});

app.get('/login', function(req, res, next){

    res.render('login', {env: app.env });
});

app.get('/signup', function(req, res, next){

    res.render('signup', {env: app.env });
});


app.get('*', function(req, res, next){



    if(req.session && req.session.userId){
        res.render('main', {session: req.session, env: app.env });
    }else{
        res.redirect('/login');
    }

});








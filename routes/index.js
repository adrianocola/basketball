var app = require('../app')
    ,  fs = require('fs')
    ,  u = require('underscore');

var checkKey = function(req, res, next){

    if(req.headers['x-basketball-key']===app.env.key){
        next();
    }else{
        next(new app.errors.ExpectedError(100,'Usuário não autorizado'));
    }


}


app.get('/api/games', checkKey, function(req, res, next){

    app.models.Game.find(function(err,games){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        u.each(games,function(game){
            game._doc.id = game._doc._id;
            delete game._doc._id;
        });

        res.json(games);

    });


});

app.post('/api/games', checkKey, function(req, res, next){

    var game = new app.models.Game(req.body);

    game.save(function(err){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        game._doc.id = game._doc._id;
        delete game._doc._id;

        res.json(game);

        app.io.sockets.emit('new_game',game);

    });

});

app.put('/api/games/:id', checkKey, function(req, res, next){


    app.models.Game.findOneAndUpdate({_id: req.params.id},{$set: req.body},function(err,game){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        game._doc.id = game._doc._id;
        delete game._doc._id;

        res.json(game);

        app.io.sockets.emit('game_change:' + game._doc.id,game);

    });


});

app.delete('/api/games/:id', checkKey, function(req, res, next){


    app.models.Game.findOne({_id: req.params.id},function(err,game){

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

app.get('/security', function(req, res, next){

    res.render('security', {env: app.env });
});

app.post('/check_security', function(req, res, next){

    if(req.body.key == 'kadu123'){
        res.json({key: app.env.key});
    }else{
        res.json({key: false});
    }


});

app.get('*', function(req, res, next){

    res.render('main', {env: app.env });
});








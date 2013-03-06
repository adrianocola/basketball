var app = require('../app')
    ,  fs = require('fs')
    ,  u = require('underscore');

app.get('/api/games', function(req, res, next){

    app.models.Game.find(function(err,games){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        u.each(games,function(game){
            game._doc.id = game._doc._id;
            delete game._doc._id;
        });

        res.json(games);

    });


});

app.post('/api/games', function(req, res, next){

    var game = new app.models.Game(req.body);

    game.save(function(err){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        game._doc.id = game._doc._id;
        delete game._doc._id;

        res.json(game);

    });

});

app.put('/api/games/:id', function(req, res, next){


    app.models.Game.findOneAndUpdate({_id: req.params.id},{$set: req.body},function(err,game){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        game._doc.id = game._doc._id;
        delete game._doc._id;

        res.json(game);

    });


});

app.delete('/api/games/:id', function(req, res, next){


    app.models.Game.findOne({_id: req.params.id},function(err,game){

        if(err){ next(new app.errors.UnexpectedError(err)); return; }

        if(game){
            game.remove(function(err){

                if(err){ next(new app.errors.UnexpectedError(err)); return; }

                game._doc.id = game._doc._id;
                delete game._doc._id;

                res.json(game);


            });
        }else{
            res.json(false);
        }




    });


});


app.get('*', function(req, res, next){

    res.render('main', {env: app.env });
});








var app = require('../app')
    ,  fs = require('fs');

app.get('/api/games', function(req, res, next){
    res.json({});
});

app.get('*', function(req, res, next){

    res.render('main', {env: app.env });
});








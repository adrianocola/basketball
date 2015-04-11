var app = require(__dirname + '/../app');

function clearAuthorization(req, res){

    if(req.session){
        req.session.destroy();
    }

};


function validateNonce(nonce, next, fn){

    app.redis.get('nonce:' + nonce, function(err,value){

        if(err){
            console.log(err);
            fn(false);
            return;
        }

        if(value!=null){
            app.redis.del('nonce:' + nonce,function(){
                fn(true);
            });
        }else{
            fn(false);
        }

    });

}

/**
 * generates a nonce for password cryptography
 * more details: http://en.wikipedia.org/wiki/Cryptographic_nonce
 */
app.get('/api/nonce', function(req, res, next){

    var nonce = app.uniqueId.generate();

    var multi = app.redis.multi();

    multi.set('nonce:' + nonce, '');
    multi.expire('nonce:' + nonce, 120);

    multi.exec(function(err,value){

        if(err){
            res.send(500,"Não foi possível gerar nonce");
            return;
        }

        res.send(nonce);

    });

});

app.get('/logout', function(req, res, next){

    clearAuthorization(req,res);

    res.redirect('/login');

});



app.get('/api/user/logout', function(req, res, next){


    if(!req.session.userId){
        res.json(401,"Sessão expirada!");
        return;
    }


    app.models.User.findById(req.session.userId,{},  function(err,user){

        if(err){
            res.send(500,"Não foi possível fazer logout");
            return;
        }

        clearAuthorization(req,res);

        res.json(true);

    });

});


app.get("/api/user/data", app.utils.verifyAuthorization, function(req, res, next){

    app.models.User.findById(req.session.userId)
        .exec(function(err,user){

            if(err){
                res.send(500,"Não foi possível pegar dados da conta");
                return;
            }

            delete user._doc.password;

            console.log(user);

            res.json(user);
        });

});


app.put("/api/user/data", app.utils.verifyAuthorization, function(req, res, next){

    delete req.body._id;
    delete req.body.email;

    app.models.User.findOneAndUpdate({_id: req.session.userId},{$set: req.body},{new: true},function(err,user) {

        if (err) {
            next(new app.errors.UnexpectedError(err));
            return;
        }

        res.json(user);

    });

});


app.get('/api/user/login', function(req,res,next){

    //validate nonce
    validateNonce(req.query.nonce, next, function(valid){

        if(!valid){
            clearAuthorization(req,res);
            res.send(500,"Nonce inválido");
            return;
        }

        if(!req.query.email || !req.query.password){
            clearAuthorization(req,res);
            res.send(500,"Faltando credenciais");
            return;
        }


        app.models.User.findOne({email: req.query.email.toLowerCase()},{},  function(err,user){


            if(err){
                res.send(500,"Não foi possível realizar login");
                return;
            }

            if(!user || req.query.password != app.md5.hex_md5(user.password + req.query.nonce)){

                res.send(500,"Usuário ou Password inválido");
                return;

            }

            user.last_login = new Date();

            user.save(function(err){

                req.session.userId = user._id;
                req.session.userEmail = user.email;

                delete user._doc.password;

                res.json(user);

            });




        });

    });

});

app.post("/api/user/signup", function(req, res, next){

    var reqsError = "";

    if(req.body.email == undefined || req.body.email == "") reqsError += "E-mail é obrigatório. ";
    else if(!req.body.email.match(/\S+@\S+\.\S+/)) reqsError += "Endereço de e-mail inválido. ";

    if(req.body.password == undefined || req.body.password == "") reqsError += "Senha é obrigatório. ";

    if(reqsError.length > 0){
        res.send(400,reqsError);
        return;
    }

    var user = new app.models.User();

    user.password = req.body.password;
    user.last_login = new Date();
    user.email = req.body.email.toLowerCase();

    //save user
    user.save( function(err){

        if(err){
            if(err.code == 11000){
                res.send(500,"E-mail já cadastrado");
            }else{
                console.log(err);
                res.send(500,"Não foi possível realizar cadastro");
            }

            return;

        }

        req.session.userId = user._id;
        req.session.userEmail = user.email;

        console.log('Criado user ' + user._id + ' com e-mail: ' + user.email);

        delete user._doc.password;

        res.json(user);

    });


});

app.put("/api/user/change_password", app.utils.verifyAuthorization, function(req, res, next){

    //validate nonce
    validateNonce(req.body.nonce, next, function(valid){

        if(!valid){
            clearAuthorization(req,res);
            res.send(500,"Nonce inválido");
            return;
        }

        app.models.User.findOne({_id: req.session.userId}, function(err,user){


            if(err){
                res.send(500,"Não foi possível alterar senha");
                return;
            }

            if(!user || req.body.old != app.md5.hex_md5(user.password + req.body.nonce)){

                res.send(500,"Senha antiga inválida");
                return;

            }

            user.password = req.body.new;

            user.save(function(err){

                delete user._doc.password;

                res.json(user);

            });




        });

    });

});





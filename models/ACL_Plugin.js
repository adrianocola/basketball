var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    errors = require(__dir + '/conf/errors');


//TODO fazer um esquema genérico para que o ACL nao vá para o client

//Plugin para Mongoose para suportar modelo de acesso por documento (ACL)
module.exports = function(schema, options) {

    //adiciona o campo ACL no documento
    schema.add({ ACL: {} });

    //Middleware de save do ACL, executado toda vez que um modelo é salvo.
    //Verifica se o usuário logado pode salvar o objeto
    schema.pre('save', function (next, opt, cb) {

        if(typeof opt == "object" && opt.userId){

            //Verifica se é o MASTER ou se o objeto não tem ACL
            if(opt.userId == 'MASTER' || !this.ACL){
                next(cb);
            }else if((this.ACL['*'] && this.ACL['*'].write) || (this.ACL[opt.userId] && this.ACL[opt.userId].write)){
                next(cb);
            }else{
                next(new Error(errors["101"]));
            }

        }else{
            next(new Error(errors["100"]));
        }


    })

    //Middleware de init do ACL, executado quando  um modelo é carregado do DB.
    //Verifica se o usuário logado pode acessar o objeto
    schema.pre('init', function(next, obj, opt){

        if(opt.options.userId){

            //Verifica se é o MASTER ou se o objeto não tem ACL
            if(opt.options.userId == 'MASTER' || !obj.ACL){
                next();
            }else if((obj.ACL['*'] && obj.ACL['*'].read) || (obj.ACL[opt.options.userId] && obj.ACL[opt.options.userId].read)){
                next();
            }else{
                next(new Error(errors["101"]));
            }

        }else{
            next(new Error(errors["100"]));
        }

    });

    /**
     * Adicionar valor para a segurança ACL
     *
     * @param model o modelo que irá receber o ACL
     * @param userId id do usuário que ter acesso a esse objeto. Use '*' para todos.
     * @param read tem acesso a leitura
     * @param write tem acesso a escrita
     */
    schema.methods.addACL = function(userId, read, write){

        this.ACL = this.ACL || {};

        this.ACL[userId] = {};

        if(read){
            this.ACL[userId].read = true;
        }else{
            delete this.ACL[userId].read;
        }

        if(write){
            this.ACL[userId].write = true;
        }else{
            delete this.ACL[userId].write;
        }

    };

    /**
     *
     * @param userId id do usuário que terá o ACL removido
     */
    schema.methods.removeACL = function(userID){

        this.ACL = this.ACL || {};

        if(this.ACL[userID]){
            delete this.ACL[userID];
        }

    };

};
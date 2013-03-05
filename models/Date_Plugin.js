var mongoose = require('mongoose'),
    util = require("util"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = function(schema, options){

    //adiciona os campos createdAt e updatedAt ao schema
    schema.add({ createdAt: Date, updatedAt: Date });

    //Atualiza a data de criação ou modificação do modelo na hora do save
    schema.pre('save', function (next, opt, cb) {

        //Se é um novo modelo adiciona a data de criação
        if(this.isNew){
            this.createdAt = new Date();
            //senão muda a data de alteração
        }else{
            this.updatedAt = new Date();
        }

        next();

    })

}
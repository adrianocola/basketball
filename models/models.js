var deps = require(__dir +  '/deps'),
    mongoose = require('mongoose'),
    util = require("util"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId,
    Date_Plugin = require('./Date_Plugin')

//TODO considerar desabilitar o autoIndex do mongoose em produção (http://mongoosejs.com/docs/guide.html#indexes)

var CustomerSchema = new Schema({
    user:{ type: Schema.ObjectId, ref: 'User', index: {unique: true, sparse: true}},
    public: { type: Boolean, default: true }, //se tem perfil público ou privado
    name: {type: String, index: {sparse: true}},
    cpf: {type: String, index: {unique: true, sparse: true}}, //não pode ser número pq não dá pra fazer busca com regex com número
    logo: {type: String, default: ""},
    email: {type: String, index: {unique: true, sparse: true}},
    genre: String,
    birthday: Date,
    country: String,
    state: String,
    city: String,
    deletedAt: Date
},{ strict: true });
CustomerSchema.plugin(Date_Plugin);


exports.Customer = mongoose.model('Customer', CustomerSchema);

//mongoose.connect(deps.env.mongo_url);
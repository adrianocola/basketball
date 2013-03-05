var deps = require(__dir +  '/deps'),
    mongoose = require('mongoose'),
    util = require("util"),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var GameSchema = new Schema({
    name: String,
    date: Date,
    updated_at: Date,
    mTeam:{},
    oTeam: {},
    mShots: {},
    oShots: {},
    opts: {}

},{ strict: true });


exports.Game = mongoose.model('Game', GameSchema);

mongoose.connect(deps.env.mongo_url);
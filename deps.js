
var deps = module.exports = {};

deps.version = require('./package.json').version;

deps.consts = require('./conf/consts');

var env = deps.env = require('./conf/env');
env.version = deps.version;

deps.errors = require('./conf/errors');

deps.uniqueId = require('./lib/uniqueId');
deps.uniqueId.worker(process.platform=='win32'?1:process.getuid()); //para 2 processos em paralelo não gerarem o mesmo ID

deps.utils = require('./lib/utils').config(deps);
if(env.development){
    env.now = deps.utils.now();
}

deps.accounting = require('accounting');

//configura o accounting para os padrões brasileiros
deps.accounting.settings = {
    currency: {
        symbol : "R$",   // default currency symbol is '$'
        format: "%s%v", // controls output: %s = symbol, %v = value/number (can be object: see below)
        decimal : ",",  // decimal point separator
        thousand: ".",  // thousands separator
        precision : 2   // decimal places
    },
    number: {
        precision : 0,  // default precision on numbers is 0
        thousand: ".",
        decimal : ","
    }
}

deps.models = require('./models/models');
deps.moment = require('moment');
var env = module.exports = {};


env.development = !process.env.NODE_ENV;
env.production = !env.development;
//verifica se foi passado o parâmetro local (todos os serviços estarão local)
env.local = process.argv[2]==="local";

env.type_str = env.production?"production":(env.local?"development(local)":"development");

env.node_env = process.env.NODE_ENV || 'development';
env.port = parseInt(process.env.PORT) || 3000;
//env.mongo_url = process.env.MONGOLAB_URI || (env.local?'mongodb://localhost/truphy':'mongodb://heroku_app9813381:m8j86nckr0hcc5s8g42tggr1nh@ds045137.mongolab.com:45137/heroku_app9813381');

if (env.development) {

    env.url = "https://adrianocola.no-ip.org:" + env.port + "/";
    env.session = 'session';
    env.salt = 'gEaQuBoHLkZf01vLlRJpmG';

} else {


    env.url = "http://truphy.herokuapp.com/";
    env.session = 'session';
    env.salt = 'ZTCSj2ngRy4dySbwhkxJ3W';


}

if(env.local){

    env.url = "https://localhost:" + env.port + "/";

}

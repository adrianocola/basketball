var env = module.exports = {};


env.development = !process.env.NODE_ENV;
env.production = !env.development;
//verifica se foi passado o parâmetro local (todos os serviços estarão local)
env.local = process.argv[2]==="local";

env.type_str = env.production?"production":(env.local?"development(local)":"development");

env.node_env = process.env.NODE_ENV || 'development';
env.port = parseInt(process.env.PORT) || 3000;
env.mongo_url = process.env.MONGOLAB_URI || 'mongodb://localhost/basketball';

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

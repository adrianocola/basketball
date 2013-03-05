module.exports = {

    requirejs_paths: {
        //scripts
        "jquery": "vendor/jquery",
        "jquery-ui": "vendor/jquery-ui",
        "jquery-ui.touch": "vendor/jquery-ui.touch",
        "jquery.form": "vendor/jquery.form",
        "jquery.easing": "vendor/jquery.easing",
        "jquery.inputmask": "vendor/jquery.inputmask",
        "jquery.inputmask.date": "vendor/jquery.inputmask.date",
        "jquery.inputmask.numeric": "vendor/jquery.inputmask.numeric",
        "underscore": "vendor/underscore",
        "backbone": "vendor/backbone",
        "backbone.offline": "vendor/backbone.offline",
        "underscore.mixin.deepExtend": "vendor/underscore.mixin.deepExtend",
        "deep-models": "vendor/deep-models",
        "spin": "vendor/spin",
        "colorpicker": "vendor/colorpicker",
        "modernizr": "vendor/modernizr",
        "moment": "vendor/moment",
        "accounting": "vendor/accounting",

        "Routes": "basketball/routes",
        "Views": "basketball/views",
        "Models": "basketball/models",
        "Startup": "basketball/startup",
        "Utils": "basketball/utils"
    },
    requirejs_shim: {
        'underscore': {
            exports: '_'
        },
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'backbone.offline': {
            deps: ['underscore', 'backbone'],
            exports: 'Offline'
        },
        'deep-models': {
            deps: ['backbone','underscore','underscore.mixin.deepExtend'],
            exports: 'Backbone'
        },
        'colorpicker':{
            deps: ['jquery']
        },
        'jquery-ui':{
            deps: ['jquery']
        },
        'jquery-ui.touch':{
            deps: ['jquery','jquery-ui']
        },
        'jquery.form':{
            deps: ['jquery']
        },
        'modernizr':{
            exports: 'Modernizr'
        },
        'moment':{
            exports: 'moment'
        },
        'jquery.inputmask':{
            deps: ['jquery']
        },
        'jquery.inputmask.numeric':{
            deps: ['jquery','jquery.inputmask']
        },
        'jquery.inputmask.date':{
            deps: ['jquery','jquery.inputmask']
        },
        'accounting':{
            exports: 'accounting'
        }
    }
}
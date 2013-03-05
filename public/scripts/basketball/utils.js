

define([
    'jquery',
    'underscore',
    'backbone',
    'spin',
    'jquery-ui'
], function($,
            _,
            Backbone,
            Spinner){

    var module = {};

    module.uniqueId = function () {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    module.isNumber = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    module.getURLParameter = function(name){
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
    }

    module.getCookie = function(c_name){
        var i,x,y,ARRcookies=document.cookie.split(";");
        for (i=0;i<ARRcookies.length;i++)
        {
            x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
            y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
            x=x.replace(/^\s+|\s+$/g,"");
            if (x==c_name)
            {
                return decodeURI(y);
            }
        }
    }

    //pega a data atual (porém se for em dev pode retornar outra data, para testes)
    module.now = function(){
        if(basketball.env_development){
            return new Date(new Date(basketball.now).getFullYear(), new Date(basketball.now).getMonth(), new Date(basketball.now).getDate(), new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds());
        }else{
            return new Date();
        }
    }

    module.invalidField = function(el,msg,pos){
        msg = msg || 'Campo de preenchimento obrigatório';
        pos = pos || 'help-bottom-right';
        el.addClass('invalid');
        //el.before('<img class="validateIcon" src="/images/field_error.png"/>');

        var string = '<div class="fieldValidateIcon help ' + pos + '">'+
                        '<img class="helpImage" src="/images/field_error.png"/>'+
                        '<div class="helpMsg helpMsgRed">'+
                            '<div class="helpText">'+
                                msg +
                            '</div>'+
                        '</div>'+
                    '</div>';

        el.before(string);

    }

    //el = container contendo os campos inválidos
    module.cleanInvalidFields = function(el){
        el = el || $('body');

        el.find('.invalid').removeClass('invalid');
        el.find('.fieldValidateIcon').remove();
    }

    module.removeTags = function(text){
        return $('<div>' + text + '</div>').text();
    }

    module.spinner = function(button){

        var loading_spinner_opts = {
            lines: 7, // The number of lines to draw
            length: 3, // The length of each line
            width: 3, // The line thickness
            radius: 4, // The radius of the inner circle
            corners: 1, // Corner roundness (0..1)
            rotate: 0, // The rotation offset
            color: '#000', // #rgb or #rrggbb
            speed: 1, // Rounds per second
            trail: 46, // Afterglow percentage
            shadow: false, // Whether to render a shadow
            hwaccel: false, // Whether to use hardware acceleration
            className: 'spinner', // The CSS class to assign to the spinner
            zIndex: 2e9, // The z-index (defaults to 2000000000)
            top: '-10', // Top position relative to parent in px
            left: 'auto' // Left position relative to parent in px
        };

        var width = button.width();
        var height = button.height();
        var text = button.html();
        button.html('');
        button.attr('disabled','disabled');
        button.width(width);
        button.height(height);
        var spinner = new Spinner(loading_spinner_opts).spin(button.get(0));


        return function(){
            spinner.stop();
            button.html(text);
            button.removeAttr('disabled');
        }


    }

    module.formToJson = function(el)
    {
        var o = {};
        var a = el.serializeArray();
        $.each(a, function() {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };



    // ****** BACKBONE *****


    module.setupBackbone = function(){

        //método close a ser adicionado em toda View do Backbone, pra remover zumbis
        //http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
        Backbone.View.prototype.close = function (fn) {
            //se beforeClose retornar false não deixa sair da view ainda
            if (this.beforeClose && this.beforeClose(fn)===false) {
                return false;
            }
            this.remove();
            this.unbind();

            return true;
        };

        Backbone.View.prototype.afterAdd = function () {};
    }


    module.startHistory = function(router){


        // Disable for older browsers
        var pushState = !!(window.history && window.history.pushState);
        //console.log("pushState: " + pushState);
        if(pushState){
            Backbone.history.start({pushState: pushState});
        }else{
            Backbone.history.start();
        }


        // https://gist.github.com/1142129
        // https://github.com/documentcloud/backbone/issues/456
        // Use absolute URLs  to navigate to anything not in your Router.
        if (Backbone.history){// && Backbone.history._hasPushState) {
            // Use delegation to avoid initial DOM selection and allow all matching elements to bubble
            //$('.backboneLink').click(function(evt) {
            $(document).delegate("a", "click", function(evt) {
                // Get the anchor href and protcol
                var href = $(this).attr("href");

                //verifica se o link NÃO possui a classe outsideLink. Se tiver, é pra tratar como um link normal
                if(href && href!="#" && !$(this).hasClass('outsideLink')){

                    var protocol = this.protocol + "//";

                    // Ensure the protocol is not part of URL, meaning its relative.
                    // Stop the event bubbling to ensure the link will not cause a page refresh.
                    if (href.substr(0,protocol.length) !== protocol) {
                        evt.preventDefault();

                        //verifica se view atual permite removê-la (se for false quer dizer que não permitiu)
                        if(router && router.removeCurrentView()===false){
                            return;
                        }

                        // Note: by using Backbone.history.navigate, router events will not be
                        // triggered.  If this is a problem, change this to navigate on your router
                        if(Backbone.history._hasPushState){
                            //History.pushState(null,null,href);
                              if (("/" + Backbone.history.fragment) === href) {
                                // need to null out Backbone.history.fragement because
                                // navigate method will ignore when it is the same as newFragment
                                Backbone.history.fragment = null;
                            }
                            Backbone.history.navigate(href, true);

                        }else{
                            window.location.href = '/#' + href.substr(1);
                            //Backbone.history.navigate(href, true);
                        }


                    }
                }


            });

        }


    }






    return module;


    });







require(['jquery','underscore','Routes', 'Startup', 'Views'], function($,_,Routes, startup, Views) {

//        if(!window.localStorage.getItem('key')){
//            window.location.href = '/login';
//        }else{
//
//            $.ajaxSetup({
//                headers: {'X-Basketball-Key': window.localStorage.getItem('key')}
//            });
//            $('body').css('display','block');
//
//            Routes.initialize();
//        }

        $('body').css('display','block');
        $('#main').css('display','block');

        if(!window.localStorage.getItem('user')){
            if(basketball.online){
                new Views.ErrorView({msg: "Sessão Expirada! Faça login novamente para continuar ", action: "login"}).render();
            }else{
                new Views.ErrorView({msg: "Você está no modo <b>offline</b> mas não fez login. Consiga conexão com a internet e faça login antes de continuar ", action: "refresh"}).render();
            }
        }else{

            Routes.initialize();

            $("#logged").html(new Views.UserView().render().el);

        }


        return {};
    }
);
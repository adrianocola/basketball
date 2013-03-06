

require(['jquery','underscore','Routes', 'Startup'], function($,_,Routes) {

        if(!window.localStorage.getItem('key')){
            window.location.href = '/security';
        }else{

            $.ajaxSetup({
                headers: {'X-Basketball-Key': window.localStorage.getItem('key')}
            });
            $('body').css('display','block');

            Routes.initialize();
        }



        return {};
    }
);
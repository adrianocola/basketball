

define([
    'jquery',
    'underscore',
    'backbone',
    'moment',
    'Views',
    'jquery-ui'
], function($,
            _,
            Backbone,
            moment,
            Views){

    //Tratamento de error default que é executado antes de qualquer
    //outro tratamento de erros. Pega erros genéricos e de conexão
    function error_handler(jqxhr, exception, error, fn){

        if (jqxhr.status == 401) {
            new Views.ErrorView({msg: "Sessão Expirada!", action: "login"}).render();
        } else if (jqxhr.status == 404) {
            new Views.ErrorView({msg: "Página não encontrada [Erro 404]"}).render();
        } else if (jqxhr.status == 500) {
            new Views.ErrorView({msg: "Erro no servidor [Erro 500]"}).render();
        } else if (exception === 'parsererror') {
            new Views.ErrorView({msg: "Erro de parse do JSON"}).render();
        } else if (exception === 'timeout') {
            new Views.ErrorView({msg: "Time limite do pedido foi excedido"}).render();
        } else if (exception === 'abort') {
            new Views.ErrorView({msg: "Pedido foi abortado"}).render();
        } else {
                fn(jqxhr, exception, error);
        }


    }

    $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {

        if(originalOptions.error){
            var original_error_handler = originalOptions.error;

            options.error = function(jqxhr, exception, error){
                error_handler(jqxhr, exception, error, original_error_handler);
            }
        }else{
            options.error = error_handler;
        }

    });



    //configura o datepicker do jqueryui para português do brasil
    $.datepicker.regional['pt-BR'] = {
        closeText: 'Fechar',
        prevText: '&#x3c;Anterior',
        nextText: 'Pr&oacute;ximo&#x3e;',
        currentText: 'Hoje',
        monthNames: ['Janeiro','Fevereiro','Mar&ccedil;o','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
        monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun',
            'Jul','Ago','Set','Out','Nov','Dez'],
        dayNames: ['Domingo','Segunda-feira','Ter&ccedil;a-feira','Quarta-feira','Quinta-feira','Sexta-feira','S&aacute;bado'],
        dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','S&aacute;b'],
        dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','S&aacute;b'],
        weekHeader: 'Sm',
        dateFormat: 'dd/mm/yy',
        firstDay: 0,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: ''};
    $.datepicker.setDefaults($.datepicker.regional['pt-BR']);

    //configura o moment.js para os padrões brasileiros
    moment.locale('pt-br', {
        months : "Janeiro_Fevereiro_Março_Abril_Maio_Junho_Julho_Agosto_Setembro_Outubro_Novembro_Dezembro".split("_"),
        monthsShort : "Jan_Fev_Mar_Abr_Mai_Jun_Jul_Ago_Set_Out_Nov_Dez".split("_"),
        weekdays : "Domingo_Segunda-feira_Terça-feira_Quarta-feira_Quinta-feira_Sexta-feira_Sábado".split("_"),
        weekdaysShort : "Dom_Seg_Ter_Qua_Qui_Sex_Sáb".split("_"),
        weekdaysMin : "Dom_2ª_3ª_4ª_5ª_6ª_Sáb".split("_"),
        longDateFormat : {
            LT : "HH:mm",
            L : "DD/MM/YYYY",
            LL : "D \\de MMMM \\de YYYY",
            LLL : "D \\de MMMM \\de YYYY LT",
            LLLL : "dddd, D \\de MMMM \\de YYYY LT"
        },
        calendar : {
            sameDay: '[Hoje às] LT',
            nextDay: '[Amanhã às] LT',
            nextWeek: 'dddd [às] LT',
            lastDay: '[Ontem às] LT',
            lastWeek: function () {
                return (this.day() === 0 || this.day() === 6) ?
                    '[Último] dddd [às] LT' : // Saturday + Sunday
                    '[Última] dddd [às] LT'; // Monday - Friday
            },
            sameElse: 'L'
        },
        relativeTime : {
            future : "em %s",
            past : "%s atrás",
            s : "segundos",
            m : "um minuto",
            mm : "%d minutos",
            h : "uma hora",
            hh : "%d horas",
            d : "um dia",
            dd : "%d dias",
            M : "um mês",
            MM : "%d meses",
            y : "um ano",
            yy : "%d anos"
        },
        ordinal : '%dº'
    });

});
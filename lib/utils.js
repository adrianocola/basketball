var deps = undefined;
var http = require('http');
var fs = require('fs');
var u = require('underscore');
var url = require('url');


exports.config = function(_deps){
    deps = _deps;

    return this;
}

exports.range = function(min,max){
    return Math.floor((Math.random()*(max-min+1))+min);
};

exports.random = function(max){
    return Math.floor((Math.random()*(max+1)));
};

exports.escapeRegExp = function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

exports.removeAccentsLC = function(str){
    str = str.toLowerCase();
    var __r = {
        'à':'a','á':'a','â':'a','ã':'ä','ä':'a','å':'a','æ':'a',
        'è':'e','é':'e','ê':'e','ë':'e',
        'ì':'i','í':'i','î':'i',
        'ò':'o','ó':'o','ô':'O','ö':'o',
        'ù':'u','ú':'u','û':'u','ü':'u',
        'ñ':'n','ç':'c'};

    return str.replace(/[àáâãäåæèéêëìíîòóôöùúûüñç]/g, function(m){
        return __r[m];
    });
}

//pega a data atual (porém se for em dev pode retornar outra data, para testes)
exports.now = function(){
    if(deps.env.development){
        //mês começa em 0 (janeiro)
        //return new Date(2013, 3, 5, new Date().getHours(), new Date().getMinutes(), new Date().getSeconds(), new Date().getMilliseconds());

        return new Date();
    }else{
        return new Date();
    }
}

//pega a data atual com horas, minutos e segundos zerados (porém se for em dev pode retornar outra data, para testes)
exports.now0 = function(){
    return new Date(exports.now().setUTCHours(0,0,0,0));
}


exports.isMobile = function(req){

    return req.headers['user-agent'].indexOf("Mobile") > -1;
};



exports.isNumber = function(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
};

exports.isFunction = function(functionToCheck){
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}



//******************
//**** EXTENSÕES ***
//******************


/* For a given date, get the ISO week number
 *
 * Based on information at:
 *
 *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
 *
 * Algorithm is to find nearest thursday, it's year
 * is the year of the week number. Then get weeks
 * between that date and the first day of that year.
 *
 * Note that dates in one year can be weeks of previous
 * or next year, overlap is up to 3 days.
 *
 * e.g. 2014/12/29 is Monday in week  1 of 2015
 *      2012/1/1   is Sunday in week 52 of 2011
 */
Date.prototype.getWeekNumber = function(){
    // Copy date so don't modify original
    d = deps.utils.now();
    d.setHours(0,0,0);
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    // Get first day of year
    var yearStart = new Date(d.getFullYear(),0,1);
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7)
    // Return array of year and week number
    return [d.getFullYear(), weekNo];
}


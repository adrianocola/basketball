



var errors = module.exports = {

    //erros da API
    "001": "Faltando parâmetro(s): "
};

errors.ExpectedError = function(code, error){
    this.code = code;
    this.error = error;
    Error.call(this, error);
    Error.captureStackTrace(this, arguments.callee);
}

errors.ExpectedError.prototype.__proto__ = Error.prototype;

errors.UnexpectedError = function(error){
    this.error = error;
    Error.call(this, error);
    Error.captureStackTrace(this, arguments.callee);
}

errors.UnexpectedError.prototype.__proto__ = Error.prototype;






cordova.define("com.ovz.codigobarras.CodigoBarras", function(require, exports, module) { /*global cordova*/

var exec = require("cordova/exec");

var CodigoBarras = function(){};

CodigoBarras.prototype.ejecutarLectura = function (name, successCallback, errorCallback) {
    cordova.exec(successCallback, errorCallback, "CodigoBarras", "ejecutarLectura", [name]);
};

module.exports = new CodigoBarras();

});

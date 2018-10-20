cordova.define('cordova/plugin_list', function(require, exports, module) {
module.exports = [
    {
        "file": "plugins/com.ovz.codigobarras/www/CodigoBarras.js",
        "id": "com.ovz.codigobarras.CodigoBarras",
        "pluginId": "com.ovz.codigobarras",
        "clobbers": [
            "CodigoBarras"
        ]
    },
    {
        "file": "plugins/cordova-plugin-console/www/logger.js",
        "id": "cordova-plugin-console.logger",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "cordova.logger"
        ]
    },
    {
        "file": "plugins/cordova-plugin-console/www/console-via-logger.js",
        "id": "cordova-plugin-console.console",
        "pluginId": "cordova-plugin-console",
        "clobbers": [
            "console"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.device/www/device.js",
        "id": "org.apache.cordova.device.device",
        "pluginId": "org.apache.cordova.device",
        "clobbers": [
            "device"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.dialogs/www/notification.js",
        "id": "org.apache.cordova.dialogs.notification",
        "pluginId": "org.apache.cordova.dialogs",
        "merges": [
            "navigator.notification"
        ]
    },
    {
        "file": "plugins/org.apache.cordova.statusbar/www/statusbar.js",
        "id": "org.apache.cordova.statusbar.statusbar",
        "pluginId": "org.apache.cordova.statusbar",
        "clobbers": [
            "window.StatusBar"
        ]
    },
    {
        "file": "plugins/phonegap-plugin-barcodescanner/www/barcodescanner.js",
        "id": "phonegap-plugin-barcodescanner.BarcodeScanner",
        "pluginId": "phonegap-plugin-barcodescanner",
        "clobbers": [
            "cordova.plugins.barcodeScanner"
        ]
    },
    {
        "file": "plugins/hu.dpal.phonegap.plugins.UniqueDeviceID/www/uniqueid.js",
        "id": "hu.dpal.phonegap.plugins.UniqueDeviceID.UniqueDeviceID",
        "pluginId": "hu.dpal.phonegap.plugins.UniqueDeviceID",
        "merges": [
            "window.plugins.uniqueDeviceID"
        ]
    }
];
module.exports.metadata = 
// TOP OF METADATA
{
    "cordova-plugin-whitelist": "1.0.0",
    "com.ovz.codigobarras": "1.0.0",
    "com.msopentech.websql": "0.0.9",
    "cordova-plugin-console": "1.0.1",
    "cordova-plugin-transport-security": "0.1.0",
    "org.apache.cordova.device": "0.3.0",
    "org.apache.cordova.dialogs": "0.3.0",
    "org.apache.cordova.statusbar": "0.1.10",
    "phonegap-plugin-barcodescanner": "4.0.2",
    "hu.dpal.phonegap.plugins.UniqueDeviceID": "1.2.0"
}
// BOTTOM OF METADATA
});
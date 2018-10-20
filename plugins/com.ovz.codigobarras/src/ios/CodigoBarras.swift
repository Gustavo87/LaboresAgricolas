
import Foundation

@objc(HWCodigoBarras) class CodigoBarras : CDVPlugin {
    func ejecutarLectura(command: CDVInvokedUrlCommand) {
        var message = command.arguments[0] as! String
        
        var pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAsString: "Hello \(message)")
        commandDelegate!.sendPluginResult(pluginResult, callbackId:command.callbackId)
    }
}
import Foundation
import AVFoundation


var objCaptureSession:AVCaptureSession?

var objCaptureVideoPreviewLayer:AVCaptureVideoPreviewLayer?

var vwQRCode:UIView?

var layerGuiaScan : CALayer = CALayer()

var btnCancelarScan = UIButton()

var btnFlash = UIButton()

var objCaptureDevice:AVCaptureDevice?

var imagenFondo = UIImageView()

var symbologies = [
    
    AVMetadataObjectTypeUPCECode,
    
    AVMetadataObjectTypeCode39Code,
    
    AVMetadataObjectTypeCode39Mod43Code,
    
    AVMetadataObjectTypeEAN13Code,
    
    AVMetadataObjectTypeEAN8Code,
    
    AVMetadataObjectTypeCode93Code,
    
    AVMetadataObjectTypeCode128Code,
    
    AVMetadataObjectTypePDF417Code,
    
    AVMetadataObjectTypeQRCode,
    
    AVMetadataObjectTypeAztecCode,
    
    AVMetadataObjectTypeInterleaved2of5Code,
    
    AVMetadataObjectTypeITF14Code,
    
    AVMetadataObjectTypeDataMatrixCode]



var respuestafinal : String = "Inicial"

@objc(HWCodigoBarras) class CodigoBarras : CDVPlugin, AVCaptureMetadataOutputObjectsDelegate {
    
    func ejecutarLectura(_ command: CDVInvokedUrlCommand) {
        
        respuestafinal = command.callbackId
        
        for vistas in (self.webView?.subviews)!{
            vistas.isHidden = true
        }

        self.configureVideoCapture()
        self.addVideoPreviewLayer()

    }
    
    
    func obtenerUUID(_ command: CDVInvokedUrlCommand){
        let pluginresult:CDVPluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: UIDevice.current.identifierForVendor?.uuidString)
        commandDelegate?.send(pluginresult, callbackId: command.callbackId)
        
    }

    func initializeQRView() {
        
        layerGuiaScan.frame = CGRect(x: (webView?.bounds)!.midX , y: ((webView?.bounds)!.midY) - 150, width: 5, height: 300)
        layerGuiaScan.backgroundColor = UIColor.green.withAlphaComponent(0.5).cgColor
        self.webView!.layer.addSublayer(layerGuiaScan)

        btnCancelarScan.setTitle("Cancelar", for: UIControlState())
        btnCancelarScan.setTitleColor(UIColor.white, for: UIControlState())
        btnCancelarScan.backgroundColor = UIColor.red.withAlphaComponent(0.7)
        btnCancelarScan.frame = CGRect(x: 0, y: ((webView?.bounds.height)! - 50), width: (webView?.bounds.width)!, height: 50)
        btnCancelarScan.addTarget(self, action: #selector(CodigoBarras.cancelarScan(_:)), for: .touchUpInside)
        self.webView!.addSubview(btnCancelarScan)
        
        
        btnFlash.setTitle("Activar Flash", for: UIControlState())
        btnFlash.setTitleColor(UIColor.white, for: UIControlState())
        
    
        imagenFondo = UIImageView(frame: CGRect(x: (webView?.bounds.width)! - 26, y:  (25 - 8), width: 16, height: 16))
        imagenFondo.image = UIImage(named: "fs.png")
        btnFlash.addSubview(imagenFondo)
        btnFlash.sendSubview(toBack: imagenFondo)
        btnFlash.backgroundColor = UIColor.gray.withAlphaComponent(0.8)
        btnFlash.frame = CGRect(x: 0, y: 0, width: (webView?.bounds.width)!, height: 50)
        btnFlash.addTarget(self, action: #selector(CodigoBarras.activarFlash(_:)), for: .touchUpInside)
        self.webView!.addSubview(btnFlash)
    }
    
    
    
    func cancelarScan(_ sender: UIButton!) {
        
        let alertView = UIAlertView()
        alertView.addButton(withTitle: "Aceptar");
        alertView.title = "Aviso";
        alertView.message = "Canceló el escaneo";
        alertView.show();

        
        btnCancelarScan.removeFromSuperview()
        btnFlash.removeFromSuperview()
        for vistas in (self.webView?.subviews)!{
            vistas.isHidden = false
        }
        objCaptureVideoPreviewLayer!.zPosition = -1000
        objCaptureSession?.stopRunning()
        objCaptureVideoPreviewLayer!.isHidden = true
        objCaptureVideoPreviewLayer!.removeFromSuperlayer()
        finalizaGuiaScan()
        
    }
    
    func activarFlash(_ sender: UIButton!) {

        //Enciende el flash si son horas viables.
        if (objCaptureDevice!.hasTorch){
            do {
                try objCaptureDevice!.lockForConfiguration()
                
                if(objCaptureDevice!.torchMode == AVCaptureTorchMode.off){
                    imagenFondo.image = UIImage(named: "flash_off.png")
                    try objCaptureDevice!.setTorchModeOnWithLevel(1.0)
                    print("Activo el flash")
                    btnFlash.setTitle("Desactivar Flash", for: UIControlState())
                    btnFlash.backgroundColor = UIColor.init(red: 0/255.0, green: 67.0/255.0, blue: 93.0/255.0, alpha: 0.8)
                }
                else{
                    imagenFondo.image = UIImage(named: "fs.png")
                    objCaptureDevice!.torchMode = AVCaptureTorchMode.off
                    print("Desactivo el flash")
                    btnFlash.setTitle("Activar Flash", for: UIControlState())
                    btnFlash.backgroundColor = UIColor.gray.withAlphaComponent(0.8)
                    
                }
                
                objCaptureDevice!.unlockForConfiguration()
            }
            catch{
                print(error)
            }
        }
    }
    
    
    
    func finalizaGuiaScan(){
        layerGuiaScan.removeFromSuperlayer()
        btnCancelarScan.removeFromSuperview()
        btnFlash.removeFromSuperview()
        
    }
    
    
    
    func addVideoPreviewLayer()
        
    {
        
        objCaptureVideoPreviewLayer = AVCaptureVideoPreviewLayer(session: objCaptureSession)
        objCaptureVideoPreviewLayer?.videoGravity = AVLayerVideoGravityResizeAspectFill
        objCaptureVideoPreviewLayer?.frame = webView!.layer.bounds
        
        self.webView!.layer.addSublayer(objCaptureVideoPreviewLayer!)
        objCaptureSession?.startRunning()
        initializeQRView()
    }
    
    
    
    func configureVideoCapture() {
        
         objCaptureDevice = AVCaptureDevice.defaultDevice(withMediaType: AVMediaTypeVideo)
        var error:NSError?
        
        let objCaptureDeviceInput: AnyObject!
        
        do {
            
            objCaptureDeviceInput = try AVCaptureDeviceInput(device: objCaptureDevice) as AVCaptureDeviceInput
        
            
        } catch let error1 as NSError {
            
            error = error1
            
            objCaptureDeviceInput = nil

            for vistas in (self.webView?.subviews)!{
                vistas.isHidden = false
            }
            
        }

        if (error != nil) {
            print(error)
            
            let alertView:UIAlertView = UIAlertView(title: "Error en Dispositivo", message:"Su dispositivo no soporta el escaneo " + (error?.localizedDescription)!, delegate: nil, cancelButtonTitle: "Ok")
            
            alertView.show()
            
            
            
            for vistas in (self.webView?.subviews)!{
                vistas.isHidden = false
            }
            return
        }

        objCaptureSession = AVCaptureSession()
        objCaptureSession?.addInput(objCaptureDeviceInput as! AVCaptureInput)
        let objCaptureMetadataOutput = AVCaptureMetadataOutput()
        objCaptureSession?.addOutput(objCaptureMetadataOutput)
        objCaptureMetadataOutput.setMetadataObjectsDelegate(self, queue: DispatchQueue.main)
        objCaptureMetadataOutput.metadataObjectTypes = symbologies
        
    }
    
    
    
    
    
    func captureOutput(_ captureOutput: AVCaptureOutput!, didOutputMetadataObjects metadataObjects: [Any]!, from connection: AVCaptureConnection!)  {
        
        
        
        if metadataObjects == nil || metadataObjects.count == 0 {
            
            vwQRCode?.frame = CGRect.zero
            // print( "NO QRCode text detacted")
            // return "NO QRCode text detacted"
        }
        
        let objMetadataMachineReadableCodeObject = metadataObjects[0] as! AVMetadataMachineReadableCodeObject

        for symbology in symbologies{

            if objMetadataMachineReadableCodeObject.type == symbology {
                
                let objBarCode = objCaptureVideoPreviewLayer?.transformedMetadataObject(for: objMetadataMachineReadableCodeObject as AVMetadataMachineReadableCodeObject) as! AVMetadataMachineReadableCodeObject
                
                vwQRCode?.frame = objBarCode.bounds;
                
                if objMetadataMachineReadableCodeObject.stringValue != nil {

                    let pluginResult = CDVPluginResult(status: CDVCommandStatus_OK, messageAs: objMetadataMachineReadableCodeObject.stringValue)
                    
                    (self.commandDelegate?.send(pluginResult, callbackId: respuestafinal))!

                    self.webView!.layer.addSublayer(objCaptureVideoPreviewLayer!)

                    for vistas in (self.webView?.subviews)!{
                        vistas.isHidden = false

                    }
   
                    objCaptureVideoPreviewLayer!.zPosition = -1000
                    objCaptureSession?.stopRunning()
                    objCaptureVideoPreviewLayer!.isHidden = true
                    objCaptureVideoPreviewLayer!.removeFromSuperlayer()
                    finalizaGuiaScan()

                }
                
            }
            
        }
        
        
        
        
        
    }
    
    
    
}

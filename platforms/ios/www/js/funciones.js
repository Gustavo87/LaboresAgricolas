var TIMEOUT_CONSULTAS = 25000;
var TIMEOUT_INSERCION = 300000;
var TOTAL_MAESTROS = 5;
var clickTimer = null;
var contenedorActual = "";
var contenedorEmp = "";
var porcentajeCompletado = 0;
var barcode = "";
var fecha_general = "";
var tiempo_click = 0;
var estado_registro;
var respuesta_ws_gb;
var Version_app=$('.version_app').text().trim().split(' ')[1];
var services = {
host: 'http://190.212.139.237:90'
}

if (services.host=='http://190.212.139.237:90'){
    $('.app_ambiente').html('PILOTO');
}


var funciones = {
dispositivoID: "49DBE1AA-75DB-4F35-B0F1-95B8B95C1017",
empleadoEscaneado:{
asistencia:0,
actividad:0
},
apuntesPendiente: 0,
asistenciasPendientes: 0,
ultimaConexion: "",
estadoConexion: "",
empresa: "",
empleados: {
dataAsistencia: {
nombre: "",
ficha: "",
cedula: ""
},
dataEmpleadoActividad: {
nombre: "",
ficha: "",
cedula: ""
},
insertarAsistenciaAutomatica: function(){
    var fecha = new Date();
    var asistencia = {
    Fecha_Asistencia: fecha_general,
    Presencia_Control: 1,
    Presencia_Pegue: 1,
    Codigo_Contratista: '',
    Nombre_Contratista: '',
    Codigo_Capataz: '',
    Nombre_Capataz: '',
    Supervisor: '',
    Cuadrilla: 'Generado',
    Ruma: $("#inp_rumaDE").val(),
    Codigo_Empleado: funciones.empleados.dataEmpleadoActividad.ficha,
    Cedula_Empleado: funciones.empleados.dataEmpleadoActividad.cedula,
    Nombre_Empleado: funciones.empleados.dataEmpleadoActividad.nombre,
    Estado: 0,
    Usuario_Transaccion: funciones.usuarios.data.nombre,
    Fecha_Transaccion: funciones.generales.HoraCompleta(fecha,true),
    Id_Transaccion: 0,
    Control_Escaneado:1,
    Pegue_Escaneado:1
    };
    db_Labores.insertar_asistencia(asistencia);
    
},
cargarEmpleado: function (arr_empleado,ul) {
    $("#lector-codigo").removeClass();
    $('#inp_empleado').removeClass("loading");
    var li = "";
    var p = "";
    if (arr_empleado.length > 0) {
        for (var i = 0; i < arr_empleado.length; i++) {
            //if (arr_empleado[i].Cedula != null) {
            //    p = "<p>" + arr_empleado[i].Ficha + "| " + arr_empleado[i].Cedula + "</p>"
            //}
            //else {
            //    p = "<p>" + arr_empleado[i].Ficha + "</p>"
            //}
            li += "<li>" +
            "<h1>" + arr_empleado[i].Ficha +" - "+arr_empleado[i].Nombre + "</h1>" +
            "</li>";
        }
    }
    else {
        li = "<div>No se encontraron empleados</div>";
    }
    $("#"+ul).html(li);
    $("#"+ul).removeClass("hide");
    
    if (barcode != "") {
        if ($("#"+ul+">li").length == 1) {
            $("#"+ul+" > li").click()
        }
    }
    barcode = "";
    
}
},
usuarios: {
data: {
nombre: "",
clave: "",
estado: "",
Modulo_ID:"",
Modulo:"",
AsistenciaOpcional:0,
ScanOpcional:0
},
usuarioConectado: function () {
    
    if (funciones.usuarios.data.nombre != "" && funciones.usuarios.data.clave != "") {
        
         funciones.generales.transicionPantalla("contenedor_login", "contenedor_general");
        var bajoDatos=false;
        var data="";
        funciones.usuarios.configurarUI(data,bajoDatos);
       
    
    }
   
},
guardarUsuario: function () {
    
    var _keySt = "$3RLubr!c4n73sNI";
    var contrasena = $('#txt_clave').val();
    
    funciones.usuarios.data.nombre = $('#txt_usuario').val();
    funciones.usuarios.data.clave = funciones.generales.EncryptStringToAES(contrasena, _keySt);
    db_Labores.limpiar_tabla("Usuarios_Nueva");
    if (navigator.onLine == true) {
        funciones.usuarios.data.estado = "false";
        funciones.usuarios.autenticarUsuario(funciones.usuarios, "login");
    }
    else {
        alert("Actualmente no posee conexion, favor conectarse a la red para iniciar sesion", "");
        $('#loader-login').addClass('hide');
        $('.formulario_login>div').removeClass("hide");
    }
    $('#txt_usuario').val("");
    $('#txt_clave').val("");
    
},
    
configurarUI: function(data,bajoDatos){
    
    
    console.log("Datos...");
    console.log(data);

    //Configuramos los inputs de Ruma para 10 caracteres maximos
    
    var valida_Ruma=function(){
        var object=this;
        if (object.value.length > object.maxLength)
            object.value = object.value.slice(0, object.maxLength)
    }
    
    $("#inp_ruma").on("input",valida_Ruma);
   
    $("#inp_rumaDE").on("input",valida_Ruma);
    
    
    if(bajoDatos==true){
        
        //Setea modulo, y los flags (asistencia y busqueda) en el objeto
        funciones.usuarios.data.Modulo_ID             =  data.Resultado[0].Modulo_ID;
        funciones.usuarios.data.Modulo             =  data.Resultado[0].Modulo;
        
        if(data.Resultado[0].AsistenciaOpcional != undefined){
            funciones.usuarios.data.AsistenciaOpcional =  data.Resultado[0].AsistenciaOpcional;
            funciones.usuarios.data.ScanOpcional       =  data.Resultado[0].ScanOpcional;
        }
        else{
            funciones.usuarios.data.AsistenciaOpcional =  0;
            funciones.usuarios.data.ScanOpcional =  0;
        }
     
        
        //Actualizamos la tabla Usuario
        db_Labores.actualizar_PermisosUsuario(funciones.usuarios.data.nombre,funciones.usuarios.data.Modulo_ID,funciones.usuarios.data.Modulo,funciones.usuarios.data.AsistenciaOpcional,funciones.usuarios.data.ScanOpcional);
    
    }
    
    //Pone el nombre del modulo en la pantalla de configuracion
    $('.modulo_app').html('Modulo: ' +funciones.usuarios.data.Modulo);
    

    //Puede Buscar codigos de empleado
    if(funciones.usuarios.data.ScanOpcional==0){
        
        $('#inp_empleado').attr('readonly','true');
        $('#inp_empleadoDE').attr('readonly','true');
        $('.scanner_info').html("Scanner Obligatorio");
        
        
    }else{
        //No puede Buscar codigos de empleado
        
        $('#inp_empleado').removeAttr('readonly');
        $('#inp_empleadoDE').removeAttr('readonly');
        $('.scanner_info').html("Scanner Opcional");
        
    }
    
    
    //No muestra pantalla Asistencia
    
    if(funciones.usuarios.data.AsistenciaOpcional==1){
        
        $("#nav_asistencias").addClass("hide");
        $("#nav_actividades").trigger("touchstart");
        $(".asisten_info").html("Asistencia No Requerida");
        
        
    }else{
    //Muestra pantalla Asistencia
        $("#nav_asistencias").removeClass("hide");
        $(".asisten_info").html("Asistencia Requerida");
    }
    
},
    
autenticarUsuario: function (usuario, opc) {
    
    console.log(services.host + "/AgroIndustria/Labores/ALA/Labores?Metodo=AuthenticateUser"+"&cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app);
    
    $.ajax({
           url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=AuthenticateUser',
           data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
           type: "GET",
           timeout: TIMEOUT_CONSULTAS,
           success: function (data) {
           
           if (data.Exito == false) {
            alert(data.MensajeError,"");
           }
           
           db_Labores.actualizar_usuario(funciones.usuarios.data.nombre, "true");
           funciones.usuarios.data.estado     = "true";
           
           funciones.generales.transicionPantalla("contenedor_login", "contenedor_general");
           
           var bajoDatos=true;
           funciones.usuarios.configurarUI(data,bajoDatos);
           
           
           db_Labores.insertar_usuario(funciones.usuarios.data.nombre, funciones.usuarios.data.clave, funciones.usuarios.data.estado,funciones.usuarios.data.Modulo_ID,funciones.usuarios.data.Modulo,funciones.usuarios.data.AsistenciaOpcional,funciones.usuarios.data.ScanOpcional);

           
           $('#loader-login').addClass('hide');
           $('.formulario_login>div').removeClass("hide");
           
           },
           error: function (response) {
           alert(response.responseJSON.Resultado, "");
           $('#loader-login').addClass('hide');
           $('.formulario_login>div').removeClass("hide");
           }
           });
}
},
cuadro: {
cargarCuadros: function (arr_cuadros) {
    var option = "";
    $("#inp_cuadro").empty();
    if (arr_cuadros.length > 0) {
        for (var i = 0; i < arr_cuadros.length; i++) {
            option += "<option data-areaPlantio='" + arr_cuadros[i].AreaCuadro + "'>" + arr_cuadros[i].Cuadro + "</option>";
        }
    }
    $("#inp_cuadro").append(option);
}
},
plantio: {
data: {
codigo: "",
nombre: "",
unidadProduccion:"",
cantidadProduccion:0,
areaPlantio: 0
},
cargarOrdenServicios: function (arr_orden_servicios) {
    var li = "";
    var p = "";
    if (arr_orden_servicios.length > 0) {
        for (var i = 0; i < arr_orden_servicios.length; i++) {
            li += "<li>" +
            "<h1 data-codigo-plantio='" + arr_orden_servicios[i].Codigo_Plantio  +"' data-plantio='" + arr_orden_servicios[i].Plantio  +"' data-orden-servicio='" + arr_orden_servicios[i].Orden_Servicio  +"' data-codigo-cuadro='" + arr_orden_servicios[i].Codigo_Cuadro  +"' data-cuadro='" + arr_orden_servicios[i].Cuadro +"' data-area-cuadro='" + arr_orden_servicios[i].Area_Cuadro +"'>OS-" +  arr_orden_servicios[i].Orden_Servicio + " | " + arr_orden_servicios[i].Codigo_Plantio + "/" + arr_orden_servicios[i].Codigo_Cuadro + "-" + arr_orden_servicios[i].Plantio  + "</h1></li>";
        }
    }
    else {
        li = "<div>No se encontraron plantios</div>";
    }
    $("#ul_ordenServicio").html(li);
    $("#ul_ordenServicio").removeClass("hide");
}
},
labores: {
data: {
codigo: "",
nombre: ""
},
cargarUDMLabor: function(data){
    console.log( data[0]);
    $("#inp_unidad_produccion").val(data[0].UnidadProduccion + " - " + data[0].UnidadProduccionN);
    if(data[0].UnidadProduccion == data[0].UnidadPago){
        $("#contenedor_unidad_produccion").addClass("hide");
        $(".contenedor_cantidad_produccion").addClass("hide");
        
    }
    else{
        $("#contenedor_unidad_produccion").removeClass("hide");
        $(".contenedor_cantidad_produccion").removeClass("hide");
    }

},

cargarLabores: function (arr_labores) {
    var li = "";
    var p = "";
    if (arr_labores.length > 0) {
        for (var i = 0; i < arr_labores.length; i++) {
            li += "<li>" +
            "<h1 data-udm='"+ arr_labores[i].UnidadProduccion +"' data-udm-n='"+ arr_labores[i].UnidadProduccionN +"' >" + arr_labores[i].Codigo + " - " + arr_labores[i].Nombre + "</h1>"
            "</li>";
        }
    }
    else {
        li = "<div>No se encontraron labores</div>";
    }
    $("#ul_actividad").html(li);
    $("#ul_actividad").removeClass("hide");
},
    
cargarActividadesOrdenServicio: function (arrActividades) {
    var listaOpciones = "";
    if (arrActividades.length > 0) {
        for (var i = 0; i < arrActividades.length; i++) {
            listaOpciones += "<option data-codigo-actividad='"+ arrActividades[i].Codigo_Actividad +"' data-actividad='"+ arrActividades[i].Actividad +"'>" + arrActividades[i].Codigo_Actividad + " - " + arrActividades[i].Actividad + "</option>";
        }
        
        funciones.labores.data.codigo = arrActividades[0].Codigo_Actividad;
        funciones.labores.data.nombre = arrActividades[0].Actividad;
    }
    else {
        listaOpciones = "<option>No se encontraron Actividades</option>";
    }
    $("#sl_actividades").html(listaOpciones);
}
    
},
supervisor: {
data: {
codigo: "",
nombre: ""
},
cargarSupervisores: function (arr_sup) {
    var li = "";
    var p = "";
    if (arr_sup.length > 0) {
        for (var i = 0; i < arr_sup.length; i++) {
            li += "<li>" +
            "<h1>" + arr_sup[i].Codigo + " - " + arr_sup[i].Nombre + "</h1>"
            "</li>";
        }
    }
    else {
        li = "<div>No se encontraron supervisores</div>";
    }
    $("#supervisor-encontrados").html(li);
    $("#supervisor-encontrados").removeClass("hide");
}
},
contratista: {
dataAsistencia: {
codigo: "",
nombre: ""
},
dataActividad: {
codigo: "",
nombre: ""
},
cargarContratista: function (arr_contrata,ul) {
    var li = "";
    var p = "";
    if (arr_contrata.length > 0) {
        for (var i = 0; i < arr_contrata.length; i++) {
            li += "<li>" +
            "<h1>" + arr_contrata[i].Codigo + " - " + arr_contrata[i].Nombre + "</h1>"
            "</li>";
        }
    }
    else {
        li = "<div>No se encontraron contratistas</div>";
    }
    $("#"+ul).html(li);
    $("#"+ul).removeClass("hide");
}
},
rutas: {
data: {
codigo: "",
nombre: ""
},
cargarRutas: function (arr_rutas) {
    var option = "";
    $("#ruta").empty();
    if (arr_rutas.length > 0) {
        for (var i = 0; i < arr_rutas.length; i++) {
            option += "<option>" + arr_rutas[i].Codigo + "</option>";
        }
    }
    $("#ruta").append(option);
}
},
CentroCosto: {
data: {
codigo: "",
nombre: ""
},
cargarCentroCosto: function (arr_cco) {
    var li = "";
    var p = "";
    if (arr_cco.length > 0) {
        for (var i = 0; i < arr_cco.length; i++) {
            li += "<li>" +
            "<h1>" + arr_cco[i].Codigo + " - " + toProperCase(arr_cco[i].Nombre) + "</h1>"
            "</li>";
        }
    }
    else {
        li = "<div>No se encontraron centro de costo</div>";
    }
    $("#ul_cco").html(li);
    $("#ul_cco").removeClass("hide");
}
},
cuentas: {
data: {
codigo: "",
nombre: ""
},
cargarCuentas: function (arr_cuentas) {
    var li = "";
    var p = "";
    if (arr_cuentas.length > 0) {
        for (var i = 0; i < arr_cuentas.length; i++) {
            li += "<li>" +
            "<h1>" + arr_cuentas[i].Codigo + " - " + toProperCase(arr_cuentas[i].Nombre) + "</h1>"
            "</li>";
        }
    }
    else {
        li = "<div>No se encontraron cuentas</div>";
    }
    $("#ul_cc").html(li);
    $("#ul_cc").removeClass("hide");
}
},
capataz: {
dataAsistencia: {
nombre: "",
ficha: "",
cedula: ""
},
dataActividad: {
nombre: "",
ficha: "",
cedula: ""
}
},
asistencia: {
tieneActividad:false,
dataCargada: {
Id_Asistencia: 0,
Presencia_Control: 0,
Presencia_Pegue: 0,
Codigo_Contratista: "",
Nombre_Contratista: "",
Codigo_Capataz: "",
Nombre_Capataz: "",
Cuadrilla: "",
Ruma: 0,
Ficha_Empleado: "",
Cedula_Empleado: "",
Nombre_Empleado: "",
Estado: 0,
Usuario: "",
Fecha: "",
ID_Transaccion: 0,
Control_Escaneado:0,
Pegue_Escaneado:0
},
data:null,
guardarAsistencia: function (opc) {
    if ($("#btn_agregar_asistencia").hasClass("boton_agregar")) {
        confirm("Esta seguro que desea guardar los datos ingresados?", "", function (btnIndex) {
                if(btnIndex==1)
                {
                var fecha = new Date();
                var controlEscaneado=0;
                var pegueEscaneado = 0;
                if($("#select_tipo_asistencia").val() == "Control" && funciones.empleadoEscaneado.asistencia==1)
                {
                controlEscaneado=1;
                }
                else if($("#select_tipo_asistencia").val() == "Pegue" && funciones.empleadoEscaneado.asistencia==1)
                {
                pegueEscaneado=1;
                }
                var asistencia = {
                Fecha_Asistencia: fecha_general,
                Presencia_Control: (($("#select_tipo_asistencia").val() == "Control") ? "1" : "0"),
                Presencia_Pegue: (($("#select_tipo_asistencia").val() == "Pegue") ? "1" : "0"),
                Codigo_Contratista: funciones.contratista.dataAsistencia.codigo,
                Nombre_Contratista: funciones.contratista.dataAsistencia.nombre,
                Codigo_Capataz: funciones.capataz.dataAsistencia.ficha,
                Nombre_Capataz: funciones.capataz.dataAsistencia.nombre,
                Supervisor: funciones.usuarios.data.nombre,
                Cuadrilla: $("#inp_cuadrilla").val(),
                Ruma: $("#inp_ruma").val(),
                Codigo_Empleado: funciones.empleados.dataAsistencia.ficha,
                Cedula_Empleado: funciones.empleados.dataAsistencia.cedula,
                Nombre_Empleado: funciones.empleados.dataAsistencia.nombre,
                Estado: 0,
                Usuario_Transaccion: funciones.usuarios.data.nombre,
                Fecha_Transaccion: funciones.generales.HoraCompleta(fecha,true),
                Id_Transaccion: 0,
                Control_Escaneado:controlEscaneado,
                Pegue_Escaneado:pegueEscaneado
                }
                if (funciones.asistencia.dataCargada.Id_Asistencia == 0) {
                db_Labores.insertar_asistencia(asistencia);
                
                }
                else {
                funciones.asistencia.dataCargada.Codigo_Contratista = asistencia.Codigo_Contratista;
                funciones.asistencia.dataCargada.Nombre_Contratista = asistencia.Nombre_Contratista;
                funciones.asistencia.dataCargada.Codigo_Capataz = asistencia.Codigo_Capataz;
                funciones.asistencia.dataCargada.Nombre_Capataz = asistencia.Nombre_Capataz;
                funciones.asistencia.dataCargada.Cuadrilla = asistencia.Cuadrilla;
                funciones.asistencia.dataCargada.Ruma = asistencia.Ruma;
                funciones.asistencia.dataCargada.Ficha_Empleado = asistencia.Codigo_Empleado;
                funciones.asistencia.dataCargada.Nombre_Empleado = asistencia.Nombre_Empleado;
                funciones.asistencia.dataCargada.Cedula_Empleado = asistencia.Cedula_Empleado;
                funciones.asistencia.dataCargada.Presencia_Pegue = asistencia.Presencia_Pegue;
                //funciones.asistencia.dataCargada.Control_Escaneado = controlEscaneado;
                funciones.asistencia.dataCargada.Pegue_Escaneado = pegueEscaneado;
                db_Labores.actualizar_asistencia(funciones.asistencia.dataCargada);
                funciones.generales.resetSelectTipoAsistencia();
                }
                if (opc == "borradofull")
                {
                funciones.generales.limpiarFormularioAsistencia(opc);
                }
                else
                {
                funciones.generales.limpiarFormularioAsistencia(opc);
                }
                
                }
                });
    }
},
validarAsistenciaEmpleado: function (arr_asistencia) {
    if ($("#form_asistencia").hasClass("hide") == false)
    {
        if (arr_asistencia.length > 0) {
            if (arr_asistencia[0].item.Presencia_Pegue == "1") {
                $("#btn_agregar_asistencia").removeClass().addClass("boton_agregar_inactivo");
                //$("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar_inactivo");
                alert("Este empleado ya posee la asistencia completa");
                $("#inp_empleado").val("");
            }
            else if (arr_asistencia[0].item.Presencia_Pegue == "0" && arr_asistencia[0].item.Presencia_Control == 1) {
                $("#select_tipo_asistencia option[value='Control']").remove();
                //$("#btn_agregar_asistencia").removeClass().addClass("boton_agregar");
                funciones.generales.validarFormularioAsistencia();
                //$("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar");
                $("#select_tipo_asistencia option:first").attr('selected', 'selected');
                funciones.asistencia.dataCargada.Id_Asistencia = arr_asistencia[0].item.Id_Asistencia;
                funciones.asistencia.dataCargada.Presencia_Control = arr_asistencia[0].item.Presencia_Control;
                funciones.asistencia.dataCargada.Presencia_Pegue = arr_asistencia[0].item.Presencia_Pegue;
                funciones.asistencia.dataCargada.ID_Transaccion = arr_asistencia[0].item.ID_Transaccion;
                funciones.asistencia.dataCargada.Control_Escaneado = arr_asistencia[0].item.Control_Escaneado;
                funciones.asistencia.dataCargada.Estado = 0;
            }
        }
        else {
            funciones.asistencia.dataCargada.Id_Asistencia = 0;
            funciones.asistencia.dataCargada.Presencia_Control = 0;
            funciones.asistencia.dataCargada.Presencia_Pegue = 0;
            funciones.asistencia.dataCargada.Control_Escaneado =0;
            funciones.asistencia.dataCargada.Ruma = 0;
            //$("#btn_agregar_asistencia").removeClass().addClass("boton_agregar");
            funciones.generales.validarFormularioAsistencia();
            //$("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar");
        }
    }
    else if ($("#form_datos_empleados").hasClass("hide") == false)
    {
        if (arr_asistencia.length > 0) {
            
            if(arr_asistencia[0].item.Presencia_Pegue=="1")
            {
                //Sino es opcional se deben setear los valores de asistencia.
                if(funciones.usuarios.data.AsistenciaOpcional == 0){
                    funciones.asistencia.dataCargada.Id_Asistencia = arr_asistencia[0].item.Id_Asistencia;
                    funciones.asistencia.dataCargada.Presencia_Control = arr_asistencia[0].item.Presencia_Control;
                    funciones.asistencia.dataCargada.Presencia_Pegue = arr_asistencia[0].item.Presencia_Pegue;
                    $("#inp_rumaDE").val(arr_asistencia[0].item.Ruma);
                }
              
            }
            else
            {
                funciones.asistencia.dataCargada.Id_Asistencia = 0;
                funciones.asistencia.dataCargada.Presencia_Control = 0;
                funciones.asistencia.dataCargada.Presencia_Pegue = 0;
                alert("El empleado seleccionado no posee asistencia de pegue", "");
                $("#inp_empleadoDE").val("");
            }
        }
        else {
            funciones.asistencia.dataCargada.Id_Asistencia = 0;
            funciones.asistencia.dataCargada.Presencia_Control = 0;
            funciones.asistencia.dataCargada.Presencia_Pegue = 0;
            alert("El empleado seleccionado no posee asistencia de pegue", "");
            $("#inp_empleadoDE").val("");
        }
    }
    
},
cargarDetalleAsistencia: function (arr_asistencia) {
    
    var temp = "";
    var li = "";
    var chequeo = false;
    var pegue = false;
    var total_control=0, total_pegue=0, total_recibido=0;
    
    for (var i = 0; i < arr_asistencia.length; i++) {
        
        if (temp != arr_asistencia[i].item.Nombre_Empleado)
        {
            
            if (arr_asistencia[i].item.Presencia_Control != "0" && arr_asistencia[i].item.Presencia_Control!="")
            {
                chequeo = true;
                total_control++;
            }
            else
            {
                chequeo = false;
            }
            
            if (arr_asistencia[i].item.Presencia_Pegue!="0" && arr_asistencia[i].item.Presencia_Pegue!="")
            {
                pegue = true;
                total_pegue++;
            }
            else
            {
                pegue = false;
            }
            if(arr_asistencia[i].item.Id_Actividad_Empleado !=null)
            {
                total_recibido++;
            }
            //var chequeo = $.grep(arr_asistencia, function (e) { return e.item.Tipo_Asistencia == "Chequeo" && e.item.Ficha_Empleado == arr_asistencia[i].item.Ficha_Empleado; });
            //var pegue = $.grep(arr_asistencia, function (e) { return e.item.Tipo_Asistencia == "Pegue" && e.item.Ficha_Empleado == arr_asistencia[i].item.Ficha_Empleado; });
            li += '<li class="data_empleado" data-Empleado="' + arr_asistencia[i].item.Ficha_Empleado + '" data-fecha="' + arr_asistencia[i].item.Fecha_Asistencia + '" data-id="'+arr_asistencia[i].item.Id_Asistencia+'">' +
            '<div class="col_dataEmpleado"> <p>' + arr_asistencia[i].item.Ficha_Empleado + '</p> <small>' + arr_asistencia[i].item.Nombre_Empleado + '</small> </div>' +
            '<div class="col_checkboxs">' +
            '<span class="' + (chequeo ? "checked" : "unchecked") + '"></span>' +
            '<span class="' + (pegue ? "checked" : "unchecked") + '"></span>' +
            '<span class="' + (arr_asistencia[i].item.Id_Actividad_Empleado !=null ? "checked" : "unchecked") + '"></span>' +
            '</div>' +
            '</li>';
        }
        temp = arr_asistencia[i].item.Nombre_Empleado;
    }
    if (arr_asistencia.length == 0)
    {
        $("#ul_detalle_asistencia").html("<span class='blank-state-asistencias'>No hay asistencias registradas para el "+funciones.generales.formatearFecha(fecha_general)+"</span>");
        $("#lb_total_control").html(0);
        $("#lb_total_pegue").html(0);
        $("#lb_total_recibido").html(0);
    }
    else
    {
        $("#ul_detalle_asistencia").html(li);
        $("#lb_total_control").html(total_control);
        $("#lb_total_pegue").html(total_pegue);
        $("#lb_total_recibido").html(total_recibido);
    }
    
},
cargarAsistencia: function (arr_asistencia) {
    if(arr_asistencia.length>0)
    {
        funciones.asistencia.dataCargada.Id_Asistencia = arr_asistencia[0].item.Id_Asistencia;
        funciones.asistencia.dataCargada.Presencia_Control = arr_asistencia[0].item.Presencia_Control;
        funciones.asistencia.dataCargada.Presencia_Pegue =arr_asistencia[0].item.Presencia_Pegue;
        funciones.asistencia.dataCargada.Codigo_Contratista = arr_asistencia[0].item.Codigo_Contratista;
        funciones.asistencia.dataCargada.Nombre_Contratista = arr_asistencia[0].item.Nombre_Contratista;
        funciones.asistencia.dataCargada.Codigo_Capataz = arr_asistencia[0].item.Codigo_Capataz;
        funciones.asistencia.dataCargada.Nombre_Capataz = arr_asistencia[0].item.Nombre_Capataz;
        funciones.asistencia.dataCargada.Cuadrilla = arr_asistencia[0].item.Cuadrilla;
        funciones.asistencia.dataCargada.Ruma = arr_asistencia[0].item.Ruma;
        funciones.asistencia.dataCargada.Ficha_Empleado = arr_asistencia[0].item.Ficha_Empleado;
        funciones.asistencia.dataCargada.Nombre_Empleado = arr_asistencia[0].item.Nombre_Empleado;
        funciones.asistencia.dataCargada.Cedula_Empleado = arr_asistencia[0].item.Cedula_Empleado;
    }
},
cargarFormularioAsistencia: function (data) {
    if (data[0].item.Presencia_Pegue == 1)
    {
        $("#select_tipo_asistencia option[value='Control']").remove();
    }
    db_Labores.validar_actividadesEmpleado(data[0].item.Ficha_Empleado, fecha_general);
    $("#inp_contratista").val(data[0].item.Codigo_Contratista + "-" + data[0].item.Nombre_Contratista);
    $("#inp_capataz").val(data[0].item.Codigo_Capataz + "-" + data[0].item.Nombre_Capataz);
    $("#inp_cuadrilla").val(data[0].item.Cuadrilla);
    $("#inp_ruma").val(data[0].item.Ruma);
    $("#inp_empleado").val(data[0].item.Ficha_Empleado + "-" + data[0].item.Nombre_Empleado);
    funciones.contratista.dataAsistencia.codigo = data[0].item.Codigo_Contratista;
    funciones.contratista.dataAsistencia.nombre = data[0].item.Nombre_Contratista;
    funciones.capataz.dataAsistencia.ficha = data[0].item.Codigo_Capataz;
    funciones.capataz.dataAsistencia.nombre = data[0].item.Nombre_Capataz;
    funciones.empleados.dataAsistencia.ficha = data[0].item.Ficha_Empleado;
    funciones.empleados.dataAsistencia.nombre = data[0].item.Nombre_Empleado;
    $("#btn_finalizar_asistencia").val("Cancelar");
    $("#btn_agregar_asistencia").val("Actualizar");
    $("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar");
    if (funciones.asistencia.tieneActividad == false)
    {
        $("#btn_agregar_asistencia").removeClass().addClass("boton_agregar");
    }
    funciones.asistencia.dataCargada.Id_Asistencia = data[0].item.Id_Asistencia;
    funciones.asistencia.dataCargada.Presencia_Control = data[0].item.Presencia_Control;
    funciones.asistencia.dataCargada.Presencia_Pegue = data[0].item.Presencia_Pegue;
    $("#h1_cabecera").html("Control de Asistencia");
    funciones.generales.transicionPantalla("form_reportes", "form_asistencia");
    funciones.generales.seleccionarOpcionMenu("nav_asistencias");
    $("#span_eliminar_actividad").removeClass("hide");
    
}
},
actividad: {
existeActividad: false,
idActividad: 0,
idTransaccion:0,
data:null,
validarActividad: function () {
    
    //Validar que esta actividad muestre o no la unidad de pago
    db_Labores.obtener_udm_actividad(funciones.labores.data.codigo,$("#inp_ordenServicio").attr("data-codigo"));
    
    if(funciones.actividad.existeActividad)
    {
        confirm("Ya existen actividades con esto parámetros, desea agregar mas empleados?", "", function (btnIndex) {
                if(btnIndex==1)
                {
                $("#h1_cabecera").html("Datos Empleados");
                $("#span_retroceder").removeClass("hide");
                funciones.generales.transicionPantalla("form_generales_apunte", "form_datos_empleados");
                contenedorEmp = "form_datos_empleados";
                funciones.actividad.guardarActividad();
                }
                });
    }
    else
    {
        $("#h1_cabecera").html("Datos Empleados");
        $("#span_retroceder").removeClass("hide");
        contenedorEmp = "form_datos_empleados";
        funciones.generales.transicionPantalla("form_generales_apunte", "form_datos_empleados");
        funciones.actividad.guardarActividad();
    }
},
guardarActividad: function () {
    var fecha = new Date();
    funciones.actividad.data = {
    Fecha_Actividad: fecha_general,
    Codigo_Plantio:funciones.plantio.data.codigo,
    Nombre_Plantio:funciones.plantio.data.nombre,
    Cuadro:$("#inp_cuadro").attr("data-cuadro"),
    Area_Labor:$("#inp_area_labor").val(),
    Codigo_Actividad:funciones.labores.data.codigo,
    Nombre_Actividad:funciones.labores.data.nombre,
    Codigo_Contratista:funciones.contratista.dataActividad.codigo,
    Nombre_Contratista:funciones.contratista.dataActividad.nombre,
    Codigo_Capataz:funciones.capataz.dataActividad.ficha,
    Nombre_Capataz:funciones.capataz.dataActividad.nombre,
    Cuadrilla: $("#inp_cuadrillaDGA").val(),
    Observaciones:$("#txt_observaciones").val(),
    Supervisor:funciones.usuarios.data.nombre,
    Estado:0,
    Usuario:funciones.usuarios.data.nombre,
    Fecha: funciones.generales.HoraCompleta(fecha,true),
    ID_Transaccion:0,
    Orden_Servicio:$("#inp_ordenServicio").attr("data-codigo")
    }
}
},
actividadEmpleado: {
data: {},
guardarActividadEmpleado: function () {

            if(funciones.usuarios.data.AsistenciaOpcional){
            funciones.empleados.insertarAsistenciaAutomatica();
            }
 
            var cantidadProduccion;
            if($('.contenedor_cantidad_produccion').hasClass('hide') == false){
                cantidadProduccion=$("#inp_cantidad_produccion").val();
            }
            else{
                cantidadProduccion = $("#inp_cantidad_pago").val();
            }
    
    
            var fecha = new Date();
            var empleados_actividad = {
            Ficha_Empleado:  funciones.empleados.dataEmpleadoActividad.ficha,
            Cedula_Empleado: funciones.empleados.dataEmpleadoActividad.cedula,
            Nombre_Empleado: funciones.empleados.dataEmpleadoActividad.nombre,
            Ruma: $("#inp_rumaDE").val(),
            Codigo_CCO: funciones.CentroCosto.data.codigo,
            Nombre_CCO: funciones.CentroCosto.data.nombre,
            Codigo_CC: funciones.cuentas.data.codigo,
            Nombre_CC: funciones.cuentas.data.nombre,
            Cantidad_Actividad: $("#inp_cantidad_labor").val(),
            Cantidad_Castigo: $("#inp_cantidad_castigo").val(),
            Cantidad_Pago: $("#inp_cantidad_pago").val(),
            Alimento_Recibido: (($("#inp_alimento").is(":checked") ? "Si" : "No")),
            Supervisor: funciones.usuarios.data.nombre,
            Estado: 0,
            Usuario: funciones.usuarios.data.nombre,
            Fecha: funciones.generales.HoraCompleta(fecha,true),
            ID_Transaccion: 0,
            Empleado_Escaneado:funciones.empleadoEscaneado.actividad,
            Unidad_Produccion:funciones.plantio.data.unidadProduccion,
            Cantidad_Produccion: cantidadProduccion
            }
            if (funciones.actividad.existeActividad) {
            //Volvemos a ligar el evento touch en el boton de guardar apunte en el callback de Exito y Fallo
            db_Labores.insertar_actividad_empleado(empleados_actividad, funciones.actividad.idActividad,funciones.actividad.idTransaccion,funciones.generales.LigarEventoGuardarApunte,funciones.generales.LigarEventoGuardarApunte);
            }
            else {
            //Volvemos a ligar el evento touch en el boton de guardar apunte en el callback de Exito y Fallo
            db_Labores.insertar_actividad(funciones.actividad.data, empleados_actividad,funciones.generales.LigarEventoGuardarApunte,funciones.generales.LigarEventoGuardarApunte);
            }
            funciones.generales.limpiarFormularioActividadesEmpleado();
    
},
modificarActividadEmpleado: function () {
    
    var cantidadProduccion;
    if($('.contenedor_cantidad_produccion').hasClass('hide') == false){
        cantidadProduccion=$("#inp_cantidad_produccion").val();
    }
    else{
        cantidadProduccion = $("#inp_cantidad_pago").val();
    }
    
    var empleados_actividad = {
    Id_Actividad_Empleado:funciones.actividadEmpleado.data[0].item.Id_Actividad_Empleado,
    Ficha_Empleado: funciones.empleados.dataEmpleadoActividad.ficha,
    Cedula_Empleado: funciones.empleados.dataEmpleadoActividad.cedula,
    Nombre_Empleado: funciones.empleados.dataEmpleadoActividad.nombre,
    Ruma: $("#inp_rumaDE").val(),
    Codigo_CCO: funciones.CentroCosto.data.codigo,
    Nombre_CCO: funciones.CentroCosto.data.nombre,
    Codigo_CC: funciones.cuentas.data.codigo,
    Nombre_CC: funciones.cuentas.data.nombre,
    Cantidad_Actividad: $("#inp_cantidad_labor").val(),
    Cantidad_Castigo: $("#inp_cantidad_castigo").val(),
    Cantidad_Pago: $("#inp_cantidad_pago").val(),
    Alimento_Recibido: (($("#inp_alimento").is(":checked") ? "Si" : "No")),
    Estado: 0,
    Empleado_Escaneado:funciones.empleadoEscaneado.actividad,
    Unidad_Produccion:funciones.plantio.data.unidadProduccion,
    Cantidad_Produccion:cantidadProduccion
    }
    
    //Consolea objetos...
    console.log(empleados_actividad);
    console.log(funciones.actividadEmpleado.data[0].item);
    
    //Valida si hay cambios...
    if(funciones.actividadEmpleado.data[0].item.Ficha_Empleado!=empleados_actividad.Ficha_Empleado ||funciones.actividadEmpleado.data[0].item.Ruma!=empleados_actividad.Ruma||
       funciones.actividadEmpleado.data[0].item.Codigo_CCO!=empleados_actividad.Codigo_CCO ||
       funciones.actividadEmpleado.data[0].item.Codigo_CC!=empleados_actividad.Codigo_CC||
       funciones.actividadEmpleado.data[0].item.Cantidad_Actividad.toString()!=empleados_actividad.Cantidad_Actividad||funciones.actividadEmpleado.data[0].item.Cantidad_Pago.toString()!=empleados_actividad.Cantidad_Pago||funciones.actividadEmpleado.data[0].item.Cantidad_Castigo!=empleados_actividad.Cantidad_Castigo||funciones.actividadEmpleado.data[0].item.Alimento_Recibido!=empleados_actividad.Alimento_Recibido || funciones.actividadEmpleado.data[0].item.Unidad_Produccion!=empleados_actividad.Unidad_Produccion || funciones.actividadEmpleado.data[0].item.Cantidad_Produccion !=empleados_actividad.Cantidad_Produccion
       ){
        //Aplica cambios
        db_Labores.actualizar_actividad_empleado(empleados_actividad,funciones.generales.LigarEventoGuardarApunte,funciones.generales.LigarEventoGuardarApunte);
        
        console.log("Hay Cambios");
    }else{
        console.log("No Hay Cambios");
        funciones.generales.LigarEventoGuardarApunte();
    }
    
    funciones.generales.limpiarFormularioActividadesEmpleado();
    contenedorEmp = "";
    funciones.generales.transicionPantalla("form_datos_empleados", "form_reportes");
    $("#span_eliminar_actividad").addClass("hide");
    db_Labores.obtener_datos_reporte_apuntes(fecha_general);
    funciones.generales.seleccionarOpcionMenu("nav_reportes");
    
},
cargarDatosActividadEmpleado: function (data) {
    
    console.log("entre " + data[0].item.Id_Actividad_Empleado);
    
      if(funciones.usuarios.data.AsistenciaOpcional==0){
        db_Labores.obtener_asistencia_empleado(data[0].item.Ficha_Empleado, fecha_general, "validar");
      }

    $("#inp_empleadoDE").val(data[0].item.Ficha_Empleado + "-" + data[0].item.Nombre_Empleado);
    $("#inp_rumaDE").val(data[0].item.Ruma);
    
    
    if (data[0].item.Codigo_CCO != "")
    {
        $("#inp_cco").val(data[0].item.Codigo_CCO + "-" + data[0].item.Nombre_CCO);
        
        //Ocultamos la inversion y mostramos el CC
        
        $(".lb_cc").addClass("hide");
        $("#inp_cc").parent().addClass("hide");
        $(".lb_cambiar_centro_costo").addClass("hide");
        $(".lb_cco").removeClass("hide");
        $("#inp_cco").parent().removeClass("hide");
        $(".lb_cambiar_inversion").removeClass("hide");
        
        
    }
    if (data[0].item.Codigo_CC != "")
    {
        $("#inp_cc").val(data[0].item.Codigo_CC + "-" + data[0].item.Nombre_CC);
        
        //Ocultamos el CC y mostramos la inversion.
        $(".lb_cco").addClass("hide");
        $("#inp_cco").parent().addClass("hide");
        $(".lb_cambiar_inversion").addClass("hide");
        
        $(".lb_cc").removeClass("hide");
        $("#inp_cc").parent().removeClass("hide");
        $(".lb_cambiar_centro_costo").removeClass("hide");
    }
    
    
    
    $("#inp_cantidad_labor").val(data[0].item.Cantidad_Actividad);
    $("#inp_cantidad_castigo").val(data[0].item.Cantidad_Castigo);
    $("#inp_cantidad_pago").val(data[0].item.Cantidad_Pago);
    if(data[0].item.Alimento_Recibido=="Si")
    {
        $("#inp_alimento").prop('checked', true);
    }
    else
    {
        $("#inp_alimento").prop('checked', false);
    }
    
    //Metodologia para cargar la unidad de mdida seleccionada.
    console.log("Unidad P " + data[0].item.Unidad_Produccion);
     db_Labores.obtener_udm_labor(data[0].item.Id_Actividad_Empleado);
     //$("#inp_unidad_produccion").val(data[0].item.Unidad_Produccion);
     //window.setTimeout(function(){ $('#ul_unidad_produccion li:eq(0)').click()},100);
    
     $("#inp_cantidad_produccion").val(data[0].item.Cantidad_Produccion);
    
    $("#btn_finalizar_empleados").val("Cancelar");
    $("#btn_agregar_empleados").val("Actualizar");
    $("#btn_finalizar_empleados").removeClass().addClass("boton_agregar");
    $("#btn_agregar_empleados").removeClass().addClass("boton_agregar");
    funciones.actividadEmpleado.data = data;
    funciones.empleados.dataEmpleadoActividad.ficha = data[0].item.Ficha_Empleado;
    funciones.empleados.dataEmpleadoActividad.nombre = data[0].item.Nombre_Empleado;
    funciones.empleados.dataEmpleadoActividad.cedula = data[0].item.Cedula_Empleado;
    funciones.CentroCosto.data.codigo = data[0].item.Codigo_CCO;
    funciones.CentroCosto.data.nombre = data[0].item.Nombre_CCO;
    funciones.cuentas.data.codigo = data[0].item.Codigo_CC;
    funciones.cuentas.data.nombre = data[0].item.Nombre_CC;
    
    funciones.plantio.data.unidadProduccion = data[0].item.Unidad_Produccion;
    funciones.plantio.data.cantidadProduccion = data[0].item.Cantidad_Produccion;
    
    contenedorEmp = "form_datos_empleados";
    funciones.generales.transicionPantalla("form_reportes", "form_generales_apunte");
    funciones.generales.seleccionarOpcionMenu("nav_actividades");
    $("#span_retroceder").addClass("hide");
    $("#span_eliminar_actividad").removeClass("hide");
    contenedorActual = "form_datos_empleados";
}
},
generales: {
    
    validarAlmuerzo : function(cantidad,codigo_actividad){
        if(cantidad>0){
            alert("Este empleado ya tiene almuerzo en la actividad " + codigo_actividad + " y no se le puede pagar otro el dia de hoy.","");
            $("#inp_alimento").prop('checked',false);
        }
    },
LigarEventoGuardarApunte: function(){
    
    console.log("Ligando eventos");
    $("#btn_finalizar_empleados").on("touchstart click", funciones.generales.EventoFinalizarGuardarApunte);
    $("#btn_agregar_empleados").on("touchstart", funciones.generales.EventoGuardarApunte);
    
},
DesligarEventoGuardarApunte:function(){

    console.log("Desligando eventos");
     $("#btn_finalizar_empleados").off("touchstart click");
     $("#btn_agregar_empleados").off("touchstart");
    
},
EventoFinalizarGuardarApunte: function(e){

    if ($("#btn_finalizar_empleados").val()=="Cancelar")
    {
        contenedorEmp = "";
        $("#span_retroceder").addClass("hide");
        funciones.generales.limpiarFormularioActividadesEmpleado();
        funciones.generales.transicionPantalla("form_datos_empleados", "form_reportes");
        funciones.generales.seleccionarOpcionMenu("nav_reportes");
    }
    else
    {
        if ($("#btn_finalizar_empleados").hasClass("boton_agregar")) {
            
            //Desligamos el evento touch en el boton guardar apunte
            funciones.generales.DesligarEventoGuardarApunte();
            
            //Pedimos confirmacion
            confirm("Esta seguro que desea guardar este registro?", "", function (btnIndex) {
                    if (btnIndex == 1) {
                    
                        //Valida el registro...
                        if(funciones.generales.validarFormularioDatosEmpleados()){
                            //Pasa la validacion
                            funciones.actividadEmpleado.guardarActividadEmpleado();
                            //Pasar a la otra pantalla...
                            contenedorEmp = "";
                            funciones.generales.transicionPantalla("form_datos_empleados", "form_generales_apunte");
                        }
                        else{
                            //No pasa la validacion
                            alert("Ocurrio un error, favor, verifique los campos e intente otra vez");
                            //Si no pasa la validacion, ligamos el evento touch en el boton guardar apunte
                            funciones.generales.LigarEventoGuardarApunte();
                        }
                    }
                    else{
                    
                    //Si cancela el apunte, ligamos el evento touch en el boton guardar apunte
                    funciones.generales.LigarEventoGuardarApunte();
                    //Pasar a la otra pantalla...
                    contenedorEmp = "";
                    funciones.generales.transicionPantalla("form_datos_empleados", "form_generales_apunte");
                    
                    }
                    
                    });
            
            
        }
    }
    e.preventDefault();
    e.stopPropagation();

},
EventoGuardarApunte: function(){

    console.log("Guardar Apunte?");
    
    //Desligamos el evento touch en el boton guardar apunte
    funciones.generales.DesligarEventoGuardarApunte();
    
    //Pedimos confirmacion
    confirm("Esta seguro que desea guardar este registro?", "", function (btnIndex) {
            if (btnIndex == 1) {
            if(funciones.generales.validarFormularioDatosEmpleados()){
            
            if ($("#btn_agregar_empleados").val()=="Agregar")
            {
            
            funciones.actividadEmpleado.guardarActividadEmpleado();
            }
            else
            {
            funciones.actividadEmpleado.modificarActividadEmpleado();
            }
            }
            else{
            alert("Ocurrio un error, favor, verifique los campos e intente otra vez");
            //Si no pasa la validacion, ligamos el evento touch en el boton guardar apunte
            funciones.generales.LigarEventoGuardarApunte();
            }
            }
            else{
            
            //Si cancela el apunte, ligamos el evento touch en el boton guardar apunte
            funciones.generales.LigarEventoGuardarApunte();
            
            }
            });
    
},
Eventos: function () {
    /******Cargar datos*****/
    funciones.generales.cargarIdDispositivo();
    var fecha_actual = new Date();
    fecha_general=funciones.generales.HoraCompleta(fecha_actual,false);
    
    $("#span_fecha_general").html(funciones.generales.formatearFecha(fecha_general));
    $("#inp_fecha_general").val(fecha_general);
    db_Labores.obtener_usuario();
    StatusBar.hide();
    
    /****Eventos propios del dispositivo****/
    
    //document.addEventListener("offline", funciones.generales.actualizarEstadoConexion, false);
    //document.addEventListener("online", funciones.generales.actualizarEstadoConexion, false);
    document.addEventListener("backbutton", funciones.generales.regresar, false);
    document.addEventListener("menubutton", funciones.generales.salirAplicacion, false);
    //funciones.generales.actualizarEstadoConexion();
    
    
    
    
    $('.lb_cambiar_inversion').click(function(){
      confirm("Esta seguro que desea cambiar para realizar el cobro a una Cuenta de Inversion?", "", function (btnIndex) {
        if (btnIndex == 1) {
                                     
        $(".lb_cco").addClass("hide");
        $("#inp_cco").parent().addClass("hide");
        $(".lb_cambiar_inversion").addClass("hide");
                                     
        $(".lb_cc").removeClass("hide");
        $("#inp_cc").parent().removeClass("hide");
        $(".lb_cambiar_centro_costo").removeClass("hide");
        funciones.CentroCosto.data.codigo = "";
        funciones.CentroCosto.data.nombre = "";
       }
     });
    });
    
    $('.lb_cambiar_centro_costo').click(function(){
     confirm("Esta seguro que desea cambiar para realizar el cobro a un Centro de Costo?", "", function (btnIndex) {
        if (btnIndex == 1) {
        $(".lb_cc").addClass("hide");
        $("#inp_cc").parent().addClass("hide");
        $(".lb_cambiar_centro_costo").addClass("hide");
        $(".lb_cco").removeClass("hide");
        $("#inp_cco").parent().removeClass("hide");
        $(".lb_cambiar_inversion").removeClass("hide");
        funciones.cuentas.data.codigo = "";
        funciones.cuentas.data.nombre = "";
        }
     });
    });
    
    
    
    $('#inp_alimento').change(function(){
                              if( $(this).is(':checked')){
                              var id_actividad_empleado="";
                              if(funciones.actividadEmpleado.data[0] != undefined){
                              id_actividad_empleado= funciones.actividadEmpleado.data[0].item.Id_Actividad_Empleado;
                              }
                              
                              db_Labores.tiene_almuerzos(funciones.empleados.dataEmpleadoActividad.ficha,fecha_general,id_actividad_empleado);
                              }
                              });
    
    //Evento de actualizacion de APP
    $('#link_actualizacion').click(function(){
                                   
                                   if($(this).attr('href') != undefined){
                                   $(this).css('visibility','hidden');
                                   }
                                   else{
                                   $(this).css('visibility','visible');
                                   }
                                   
                                   });
    
    
    //Eventos botones de navegacion
    $("#nav_asistencias").on("touchstart", function (e) {
                             $("#h1_cabecera").html("Control de Asistencia");
                             funciones.generales.transicionPantalla(contenedorActual, "form_asistencia");
                             //$("#form_asistencia").removeClass();
                             //$("#form_generales_apunte").addClass("hide");
                             //$("#form_configuraciones").addClass("hide");
                             funciones.generales.seleccionarOpcionMenu("nav_asistencias");
                             });
    $("#nav_actividades").on("touchstart", function (e) {
                             $("#h1_cabecera").html("Datos Generales");
                             if (contenedorEmp != "")
                             {
                             funciones.generales.transicionPantalla(contenedorActual, contenedorEmp);
                             }
                             else
                             {
                             funciones.generales.transicionPantalla(contenedorActual, "form_generales_apunte");
                             }
                             //$("#form_asistencia").addClass("hide");
                             //$("#form_generales_apunte").removeClass();
                             //$("#form_configuraciones").addClass("hide");
                             funciones.generales.seleccionarOpcionMenu("nav_actividades");
                             e.stopPropagation();
                             });
    $("#nav_reportes").on("touchstart", function (e) {
                          $("#h1_cabecera").html("Reportes");
                          funciones.generales.transicionPantalla(contenedorActual, "form_reportes");
                          funciones.generales.seleccionarOpcionMenu("nav_reportes");
                          db_Labores.obtener_asistencia_fecha(fecha_general);
                          db_Labores.obtener_datos_reporte_labores(fecha_general);
                          db_Labores.obtener_datos_reporte_apuntes(fecha_general);
                          
                          });
    $("#nav_configuraciones").on("touchstart", function (e) {
                                 
                                 $(".usuario_logeado").html(funciones.usuarios.data.nombre);
                                 $("#h1_cabecera").html("Configuración");
                                 //$("#form_asistencia").addClass("hide");
                                 //$("#form_generales_apunte").addClass("hide");
                                 //$("#form_configuraciones").removeClass();
                                 funciones.generales.transicionPantalla(contenedorActual, "form_configuraciones");
                                 funciones.generales.seleccionarOpcionMenu("nav_configuraciones");
                                 e.stopPropagation();
                                 });
    
    //Evento contenedor general
    $(".contenedor_general").click(function () {
                                   $("#ul_contratista").addClass("hide");
                                   $("#ul_capataz").addClass("hide");
                                   if($("#ul_empleado").hasClass("hide")==false)
                                   {
                                   $("#ul_empleado").addClass("hide");
                                   funciones.generales.desplazarPantalla("cerrar");
                                   }
                                   $("#ul_capatazDGA").addClass("hide");
                                   $("#ul_contratistaDGA").addClass("hide");
                                   $("#ul_actividad").addClass("hide");
                                   $("#ul_ordenServicio").addClass("hide");
                                   });
    $("#h1_cabecera").on("touchstart",function () {
                         if (clickTimer == null) {
                         clickTimer = setTimeout(function () {
                                                 clickTimer = null;
                                                 }, 500)
                         } else {
                         clearTimeout(clickTimer);
                         clickTimer = null;
                         alert("ID dispositivo: "+funciones.dispositivoID, ""+"Nombre dispositivo:"+cordova.plugins.deviceName.name);
                         }
                         
                         });
    
    //Eventos formulario login
    $("#txt_usuario").keyup(function () {
                            funciones.generales.activarDesactivarBtnLogin();
                            });
    $("#txt_clave").keyup(function () {
                          funciones.generales.activarDesactivarBtnLogin();
                          });
    $("#btn_login").on("touchstart", function (e) {
                       if ($('#txt_clave').val() != "" && $('#txt_usuario').val() != "") {
                       $('.formulario_login>div').addClass("hide");
                       $('#loader-login').removeClass().addClass('login_cargando');
                       funciones.usuarios.guardarUsuario();
                       }
                       else {
                       $("#txt_usuario").addClass("animated tada").one('webkitAnimationEnd ', function () {
                                                                       $(this).removeClass("animated tada");
                                                                       });
                       $("#txt_clave").addClass("animated tada").one('webkitAnimationEnd ', function () {
                                                                     $(this).removeClass("animated tada");
                                                                     });
                       }
                       e.stopPropagation();
                       });
    
    //Eventos formulario asistencia
    $("#inp_empleado").focus(function () {
                             funciones.generales.desplazarPantalla();
                             });
    $("#inp_empleado").keyup(function () {
                             var data = $("#inp_empleado").val();
                             if (data.length > 0) {
                             //$("#ul_empleado").removeClass();
                             funciones.empleadoEscaneado.asistencia=0;
                             db_Labores.obtener_empleados(data,"ul_empleado",false);
                             }
                             else
                             {
                             $("#ul_empleado").addClass("hide");
                             funciones.generales.desplazarPantalla("cerrar");
                             }
                             });
    
    
    
    
    $("#ul_empleado").on("click", "li", function (e) {
                         
                         $("#inp_empleado").val($(this).find("h1").text());
                         funciones.empleados.dataAsistencia.nombre = $(this).text().split("-")[1].trim();
                         funciones.empleados.dataAsistencia.ficha = $(this).text().split("-")[0].trim();
                         //funciones.empleados.dataAsistencia.cedula = $(this).find("p").text().split("|")[1];
                         if (funciones.empleados.dataAsistencia.cedula == undefined)
                         {
                         funciones.empleados.dataAsistencia.cedula = "";
                         }
                         $("#ul_empleado").addClass("hide");
                         funciones.generales.desplazarPantalla("cerrar");
                         //Buscar asistencia (Control/Pegue)
                         if(funciones.usuarios.data.AsistenciaOpcional==0){
                          db_Labores.obtener_asistencia_empleado(funciones.empleados.dataAsistencia.ficha,fecha_general,"validar");
                         }
                        
                         
                         
                         
                         e.stopPropagation();
                         });
    $("#lector-codigo").on("touchstart", function (e) {
                           CodigoBarras.ejecutarLectura("Sa", function (respuesta)
                                                        {
                                                        var code = respuesta;
                                                        if (code.indexOf("-") == -1){
                                                        barcode = code;
                                                        }
                                                        else{
                                                        barcode = code.split('-')[1];
                                                        }
                                                        funciones.empleadoEscaneado.asistencia=1;
                                                        $("#inp_empleado").val(barcode);
                                                        db_Labores.obtener_empleados(barcode, "ul_empleado",true);
                                                        }, function (respuesta) {
                                                        })
                           e.stopPropagation();
                           });
    $("#inp_contratista").keyup(function () {
                                var data = $("#inp_contratista").val();
                                if (data.length > 0) {
                                db_Labores.obtener_contratista(data, "ul_contratista");
                                }
                                else {
                                $("#ul_contratista").addClass("hide");
                                }
                                });
    $("#ul_contratista").on("click", "li", function (e) {
                            $("#inp_contratista").val($(this).text());
                            funciones.contratista.dataAsistencia.nombre = $(this).text().split("-")[1].trim();
                            funciones.contratista.dataAsistencia.codigo = $(this).text().split("-")[0].trim();
                            $("#ul_contratista").addClass("hide");
                            e.stopPropagation();
                            });
    $("#inp_capataz").keyup(function () {
                            var data = $("#inp_capataz").val();
                            if (data.length > 0) {
                            db_Labores.obtener_empleados(data,"ul_capataz",false);
                            }
                            else {
                            $("#ul_capataz").addClass("hide");
                            }
                            });
    $("#ul_capataz").on("click", "li", function (e) {
                        $("#inp_capataz").val($(this).find("h1").text());
                        funciones.capataz.dataAsistencia.nombre = $(this).text().split("-")[1].trim();
                        //funciones.capataz.dataAsistencia.cedula = $(this).find("p").text().split("|")[1];
                        funciones.capataz.dataAsistencia.ficha = $(this).text().split("-")[0].trim();
                        $("#ul_capataz").addClass("hide");
                        e.stopPropagation();
                        });
    $("#btn_agregar_asistencia").on("touchstart", function (e) {
                                    if ($("#btn_agregar_asistencia").val() == "Agregar")
                                    {
                                    funciones.asistencia.guardarAsistencia("borradoParcial");
                                    }
                                    else {
                                    confirm("Esta seguro que desea guardar los datos ingresados?", "", function (btnIndex) {
                                            if (btnIndex == 1) {
                                            var fecha = new Date();
                                            var controlEscaneado=0;
                                            var pegueEscaneado = 0;
                                            if($("#select_tipo_asistencia").val() == "Control" && funciones.empleadoEscaneado.asistencia==1)
                                            {
                                            controlEscaneado=1;
                                            }
                                            else if($("#select_tipo_asistencia").val() == "Pegue" && funciones.empleadoEscaneado.asistencia==1)
                                            {
                                            pegueEscaneado=1;
                                            }
                                            var asistencia = {
                                            Id_Asistencia:funciones.asistencia.dataCargada.Id_Asistencia,
                                            Fecha_Asistencia: fecha_general,
                                            Presencia_Control:((funciones.asistencia.dataCargada.Presencia_Pegue== "1") ? funciones.asistencia.dataCargada.Presencia_Control:(($("#select_tipo_asistencia").val() == "Control") ? "1" : "0")),
                                            Presencia_Pegue: (($("#select_tipo_asistencia").val() == "Pegue") ? "1" : "0"),
                                            Codigo_Contratista: funciones.contratista.dataAsistencia.codigo,
                                            Nombre_Contratista: funciones.contratista.dataAsistencia.nombre,
                                            Codigo_Capataz: funciones.capataz.dataAsistencia.ficha,
                                            Nombre_Capataz: funciones.capataz.dataAsistencia.nombre,
                                            Supervisor: funciones.usuarios.data.nombre,
                                            Cuadrilla: $("#inp_cuadrilla").val(),
                                            Ruma: $("#inp_ruma").val(),
                                            Ficha_Empleado: funciones.empleados.dataAsistencia.ficha,
                                            Cedula_Empleado: funciones.empleados.dataAsistencia.cedula,
                                            Nombre_Empleado: funciones.empleados.dataAsistencia.nombre,
                                            Estado: 0,
                                            Usuario_Transaccion: funciones.usuarios.data.nombre,
                                            Fecha_Transaccion: funciones.generales.HoraCompleta(fecha,true),
                                            Control_Escaneado:controlEscaneado,
                                            Pegue_Escaneado:pegueEscaneado
                                            }
                                            db_Labores.actualizar_asistencia(asistencia);
                                            db_Labores.obtener_asistencia_fecha(fecha_general);
                                            funciones.generales.cancelarEdicionAsistencia();
                                            }
                                            });
                                    }
                                    
                                    e.stopPropagation();
                                    });
    $("#btn_finalizar_asistencia").on("touchstart click", function (e) {
                                      if ($("#btn_finalizar_asistencia").val() == "Cancelar")
                                      {
                                      funciones.generales.cancelarEdicionAsistencia();
                                      }
                                      else
                                      {
                                      funciones.generales.limpiarFormularioAsistencia("borradofull");
                                      }
                                      e.preventDefault();
                                      e.stopPropagation();
                                      });
    $("#form_asistencia input").on("blur focus", funciones.generales.validarFormularioAsistencia);
    
    //Evento formulario datos generales apuntes
    $("#inp_ordenServicio").keyup(function () {
                            var data = $("#inp_ordenServicio").val();
                            if(data.length>0)
                            {
                            db_Labores.obtener_orden_servicios(data);
                            }
                            else
                            {
                            $("#ul_ordenServicio").addClass("hide");
                            }
                            });
    $("#ul_ordenServicio").on("click", "li", function (e) {

                        $("#inp_ordenServicio").val($(this).children('h1').attr('data-orden-servicio'));
                        $("#inp_ordenServicio").attr("data-codigo",$(this).children('h1').attr('data-orden-servicio'));
                        $("#ul_ordenServicio").addClass("hide");
                        funciones.plantio.data.codigo = $(this).children('h1').attr('data-codigo-plantio')
                        funciones.plantio.data.nombre = $(this).children('h1').attr('data-plantio')
                        funciones.plantio.data.areaPlantio = $(this).children('h1').attr('data-area-cuadro')
                        $("#inp_plantio").val(funciones.plantio.data.codigo + " - " + funciones.plantio.data.nombre);
                        console.log($(this).children('h1').attr('data-codigo-cuadro') + " - " + $(this).children('h1').attr('data-cuadro'));
                        $("#inp_cuadro").val($(this).children('h1').attr('data-codigo-cuadro') + " - " + $(this).children('h1').attr('data-cuadro'));
                        $("#inp_cuadro").attr("data-cuadro",$(this).children('h1').attr('data-codigo-cuadro'));
                        db_Labores.obtener_actividades_orden_servicio($(this).children('h1').attr('data-orden-servicio'));
                        //db_Labores.obtener_cuadros(funciones.plantio.data.codigo.trim());
                        e.stopPropagation();
                        });

    $("#sl_actividades").change(function(i,item){
      funciones.labores.data.codigo = $(this).find(":selected").attr('data-codigo-actividad').trim();
      funciones.labores.data.nombre = $(this).find(":selected").attr('data-actividad').trim();
      
                                
    });
    $("#ul_actividad").on("click", "li", function (e) {
                          $("#inp_actividad").val($(this).text());
                          funciones.labores.data.codigo = $(this).text().split("-")[0].trim();
                          funciones.labores.data.nombre = $(this).text().split("-")[1].trim();
                          
                          funciones.plantio.data.unidadProduccion = $(this).children("h1").attr("data-udm");
                          funciones.plantio.data.cantidadProduccion = $(this).children("h1").attr("data-udm-n");
                          $("#inp_unidad_produccion").val($(this).children("h1").attr("data-udm") + " - " + $(this).children("h1").attr("data-udm-n"));
                          $("#ul_actividad").addClass("hide");
                          e.stopPropagation();
                          });
    $("#inp_contratistaDGA").keyup(function () {
                                   var data = $("#inp_contratistaDGA").val();
                                   if(data.length>0)
                                   {
                                   db_Labores.obtener_contratista(data, "ul_contratistaDGA");
                                   }
                                   else
                                   {
                                   $("#ul_contratistaDGA").addClass("hide");
                                   }
                                   });
    $("#ul_contratistaDGA").on("click", "li", function (e) {
                               $("#inp_contratistaDGA").val($(this).text());
                               $("#ul_contratistaDGA").addClass("hide");
                               funciones.contratista.dataActividad.codigo = $(this).text().split("-")[0].trim();
                               funciones.contratista.dataActividad.nombre = $(this).text().split("-")[1].trim();
                               e.stopPropagation();
                               });
    $("#inp_capatazDGA").keyup(function () {
                               var data = $("#inp_capatazDGA").val();
                               if(data.length>0)
                               {
                               db_Labores.obtener_empleados(data, "ul_capatazDGA",false);
                               }
                               else
                               {
                               $("#ul_capatazDGA").addClass("hide");
                               }
                               });
    $("#ul_capatazDGA").on("click", "li", function (e) {
                           $("#inp_capatazDGA").val($(this).text());
                           $("#ul_capatazDGA").addClass("hide");
                           funciones.capataz.dataActividad.nombre = $(this).text().split("-")[1].trim();
                           //funciones.capataz.dataActividad.cedula = $(this).find("p").text().split("|")[1];
                           funciones.capataz.dataActividad.ficha = $(this).text().split("-")[0].trim();
                           e.stopPropagation();
                           });
    
    
    
    $("#btn_agregar_datos_generales").on("touchstart", function (e) {
                                         
                                         funciones.generales.validarFormularioActividades();
                                         
                                         if($("#btn_agregar_datos_generales").hasClass("boton_agregar_inactivo")){
                                            alert("Falta definir algunos campos obligatorios o hay error en algunos de ellos, favor revise y pruebe nuevamente");
                                            return;
                                         }
                                         
                                         if ($("#btn_agregar_datos_generales").hasClass("boton_agregar")) {
                                         confirm("Esta seguro que desea guardar los datos ingresados?", "", function (btnIndex) {
                                                 if(btnIndex==1)
                                                 {
                                                 db_Labores.obtener_actividades(funciones.plantio.data.codigo, $("#inp_cuadro").attr("data-cuadro"), funciones.labores.data.codigo, fecha_general,
                                                                                funciones.contratista.dataActividad.codigo, funciones.capataz.dataActividad.ficha, $("#inp_cuadrillaDGA").val(),$("#inp_ordenServicio").val());
                                                 }
                                                 });
                                         }
                                         e.stopPropagation();
                                         });
    $("#btn_nueva_actividad").on("touchstart", function () {
                                 funciones.generales.limpiarFormularioActividades();
                                 });
    $("#span_retroceder").on("touchstart", function (e) {
                             $("#h1_cabecera").html("Datos Generales");
                             contenedorEmp = "";
                             funciones.generales.transicionPantalla("form_datos_empleados", "form_generales_apunte");
                             //$("#form_generales_apunte").removeClass();
                             //$("#form_datos_empleados").addClass("hide");
                             $("#h1_cabecera").html("Datos Generales");
                             $("#span_retroceder").addClass("hide");
                             //db_Labores.obtener_asistencia_todas();
                             funciones.generales.limpiarFormularioActividadesEmpleado();
                             e.stopPropagation();
                             });
    $("#form_generales_apunte input").on("blur focus", funciones.generales.validarFormularioActividades);
    
    $("#inp_cuadro").change(function(){
                            
                        
                         
                            if (funciones.plantio.data.areaPlantio < parseFloat($("#inp_area_labor").val()))
                            {
                            alert("El area labor supera el area del plantio de " + funciones.plantio.data.areaPlantio, "");
                            $("#inp_area_labor").val("0")
                            $("#btn_agregar_datos_generales").removeClass().addClass("boton_agregar_inactivo");
                            }
                            
                            });
    
    $("#inp_area_labor").on("blur focus", function () {
                            
                            if ($.isNumeric($("#inp_area_labor").val()) == false && $("#inp_area_labor").val()!= "" ){
                            alert("El valor ingresado no es un numero valido, favor ingresar el valor nuevamente.", "");
                            $("#inp_area_labor").val("0")
                            $("#btn_agregar_datos_generales").removeClass().addClass("boton_agregar_inactivo");
                            }
                            
                            if (funciones.plantio.data.areaPlantio < parseFloat($("#inp_area_labor").val()))
                            {
                            alert("El area labor supera el area del plantio de " + funciones.plantio.data.areaPlantio, "");
                            $("#inp_area_labor").val("0")
                            $("#btn_agregar_datos_generales").removeClass().addClass("boton_agregar_inactivo");
                            }
                            });
    
    //Eventos formulario empleados actividad
    $("#inp_empleadoDE").keyup(function () {
                               var data = $("#inp_empleadoDE").val();
                               if(data.length>0)
                               {
                               funciones.empleadoEscaneado.actividad=0;
                               db_Labores.obtener_empleados(data, "ul_empleadoDE",false);
                               }
                               else {
                               $("#ul_empleadoDE").addClass("hide");
                               }
                               });
    $("#ul_empleadoDE").on("click", "li", function (e) {
                           $("#inp_empleadoDE").val($(this).find("h1").text());
                           
                           
                           funciones.empleados.dataEmpleadoActividad.nombre = $(this).text().split("-")[1].trim();
                           funciones.empleados.dataEmpleadoActividad.ficha = $(this).text().split("-")[0].trim();
                           //funciones.empleados.dataEmpleadoActividad.cedula = $(this).find("p").text().split("|")[1];
                           if (funciones.empleados.dataEmpleadoActividad.cedula == undefined) {
                           funciones.empleados.dataEmpleadoActividad.cedula = "";
                           }
                           
                           $("#ul_empleadoDE").addClass("hide");
                           
                           
                           if(funciones.usuarios.data.AsistenciaOpcional==0){
                            db_Labores.obtener_asistencia_empleado(funciones.empleados.dataEmpleadoActividad.ficha, fecha_general,"validar");
                           }
                       
                           
                           db_Labores.obtener_actividadesEmpleado(funciones.empleados.dataEmpleadoActividad.ficha, fecha_general);
                           funciones.generales.validarFormularioDatosEmpleados();
                           if ($("#inp_alimento").is(":checked")){
                           var id_actividad_empleado="";
                           if(funciones.actividadEmpleado.data[0] != undefined){
                           id_actividad_empleado= funciones.actividadEmpleado.data[0].item.Id_Actividad_Empleado;
                           }
                           db_Labores.tiene_almuerzos(funciones.empleados.dataEmpleadoActividad.ficha,fecha_general,id_actividad_empleado);
                           }
                           e.stopPropagation();
                           });
    $("#lector-codigoDE").on("touchstart", function (e) {
                            CodigoBarras.ejecutarLectura("Sa", function (respuesta) {
                                                          var code = respuesta;
                                                          
                                                          if (code.indexOf("-") == -1){
                                                          barcode = code;
                                                          }
                                                          else{
                                                          barcode = code.split('-')[1];
                                                          }
                                                          funciones.empleadoEscaneado.actividad=1;
                                                          $("#inp_empleadoDE").val(barcode);
                                                          db_Labores.obtener_empleados(barcode, "ul_empleadoDE",true);
                                                          
                                                          }, function (respuesta) {
                                                          
                                                          });
                             e.stopPropagation(); 
                             });
    $("#inp_cco").keyup(function () {
                        var data = $("#inp_cco").val();
                        if (data.length > 0) {
                        db_Labores.obtener_centro_costos(data);
                        }
                        else
                        {
                        $("#ul_cco").addClass("hide");
                        }
                        });
    $("#ul_cco").on("click", "li", function (e) {
                    $("#inp_cco").val($(this).text());
                    funciones.CentroCosto.data.codigo = $(this).text().split("-")[0].trim();
                    funciones.CentroCosto.data.nombre = $(this).text().split("-")[1].trim();
                    $("#ul_cco").addClass("hide");
                    e.stopPropagation();
                    });
    $("#inp_cc").keyup(function () {
                       var data = $("#inp_cc").val();
                       if (data.length > 0) {
                       db_Labores.obtener_cuenta(data);
                       }
                       else {
                       $("#ul_cc").addClass("hide");
                       }
                       });
    $("#ul_cc").on("click", "li", function (e) {
                   $("#inp_cc").val($(this).text());
                   funciones.cuentas.data.codigo = $(this).text().split("-")[0].trim();
                   funciones.cuentas.data.nombre = $(this).text().split("-")[1].trim();
                   $("#ul_cc").addClass("hide");
                   e.stopPropagation();
                   });
    $("#inp_cantidad_labor, #inp_cantidad_castigo").on("input change", function () {
                                                       funciones.generales.calcularCantidadPago($("#inp_cantidad_labor").val(), $("#inp_cantidad_castigo").val())
                                                       });
    $("#form_datos_empleados input").on("blur focus", funciones.generales.validarFormularioDatosEmpleados);
    
    
    /*Eventos para guardar apuntes por empleado*/
    $("#btn_agregar_empleados").on("touchstart", funciones.generales.EventoGuardarApunte);
    $("#btn_finalizar_empleados").on("touchstart click", funciones.generales.EventoFinalizarGuardarApunte);
    
    $("#span_eliminar_actividad").on("touchstart", function () {
                                     confirm("Esta seguro que desea borrar este registro?", "", function (btnIndex) {
                                             if (btnIndex == 1) {
                                             if ($("#form_datos_empleados").hasClass("hide") == false)
                                             {
                                             
                                             // En caso de ser una actividad no sincronizada, borrar directamente el registro.
                                             db_Labores.validar_estado_actividad(funciones.actividadEmpleado.data[0].item.Id_Actividad_Empleado);
                                             
                                             }
                                             else if ($("#form_asistencia").hasClass("hide") == false)
                                             {
                                             // En caso de ser una asistencia no sincronizada, borrar directamente el registro.
                                             db_Labores.validar_estado_asistencia(funciones.asistencia.dataCargada.Id_Asistencia);
                                             
                                             
                                             }
                                             
                                             }
                                             });
                                     });
    
    //Eventos formulario reportes
    $("#nav_tabreportes").on("touchstart", "li", function (e) {
                             switch ($(this).attr('id')) {
                             case "li_tabLabores":
                             db_Labores.obtener_datos_reporte_labores(fecha_general);
                             break;
                             case "li_tabApuntes":
                             db_Labores.obtener_datos_reporte_apuntes(fecha_general);
                             break;
                             case "li_tabAsistencia":
                             db_Labores.obtener_asistencia_fecha(fecha_general);
                             break;
                             }
                             funciones.generales.transicionTab($("#nav_tabreportes > ul > li.tab_selected").attr('id'), $(this).attr('id'));
                             $("#nav_tabreportes li").removeClass("tab_selected");
                             $(this).addClass("tab_selected");
                             });
    $("#ul_detalle_asistencia").on("click", "li", function () {
                                   db_Labores.obtener_asistenciaID($(this).attr("data-id"));
                                   });
    $("#ul_ruma_reporte").on("touchstart", ".cabecera_ruma", function (e) {
                             if ($(this).next().hasClass("hide")) {
                             $(this).next().removeClass("hide");
                             $(this).removeClass("plegada").addClass("desplegada");
                             }
                             else {
                             $(this).next().addClass("hide");
                             $(this).removeClass("desplegada").addClass("plegada");
                             }
                             e.stopPropagation();
                             
                             
                             });
    $("#lista_apunte").on("touchstart", ".btn_editarApunte", function () {
                          var seleccionID = $(this).attr("data-id");
                          confirm("Esta seguro que desea editar el apunte del empleado seleccionado?","", function(btnIndex){
                                  if(btnIndex == 1){
                                    db_Labores.obtener_actividadesEmpleadoID(seleccionID);
                                  }
                            });
                          
                          });
    $("#lista_apunte").on("touchstart", ".cabecera_apunte", function () {
                          if ($(this).next().hasClass("hide")) {
                          $(this).next().removeClass("hide");
                          $(this).removeClass("plegada").addClass("desplegada");
                          }
                          else {
                          $(this).next().addClass("hide");
                          $(this).removeClass("desplegada").addClass("plegada");
                          }
                          });
    
    
    //Eventos del formulario de configuraciones
    $("#inp_fecha_general").blur(function () {
                                 fecha_general = $("#inp_fecha_general").val();
                                 $("#span_fecha_general").html(funciones.generales.formatearFecha(fecha_general));
                                 });
    $("#btn_cerrar_session").on("touchstart", function () {
                                confirm("Esta seguro que desea cerrar la sesión?", "", function (btnIndex) {
                                        if (btnIndex == 1) {
                                        db_Labores.limpiar_tabla("Usuarios_Nueva");
                                        funciones.generales.transicionPantalla("contenedor_general","contenedor_login");
                                        }
                                        });
                                });
    $("#btn_sincronizar_maestros").on("touchstart", funciones.generales.sincronizar_maestros);
    $("#btn_enviar_apuntes").on("touchstart", function () {
                                if (navigator.onLine == true) {
                                confirm("Esta seguro que desea sincronizar los datos?", "", function (btnIndex) {
                                        if (btnIndex == 1)
                                        {
                                        //Limpia la variable global de ingreso al detalle de empleado, para que una vez se sincronice, siempre envie a la pantalla de la ultima cabecera(Esto evitaria los nulos).
                                        contenedorEmp = "";
                                        funciones.generales.limpiarFormularioActividadesEmpleado();
                                        funciones.generales.ocultarMostrarBloqueoPantalla("", "bloquear");
                                        db_Labores.obtener_apuntes_sincronizar(fecha_general);
                                        }
                                        });
                                }
                                else
                                {
                                alert("No hay conexion al servidor","");
                                }
                                });
    
    
},
resetSelectTipoAsistencia: function () {
    $("#select_tipo_asistencia").html("<option value='Control'>Control</option><option value='Pegue'>Pegue</option>");
},
EncryptStringToAES: function (text_plain, key_str) {
    var key = CryptoJS.enc.Utf8.parse(key_str); //Llave publica compartida
    var iv = CryptoJS.enc.Utf8.parse('7061737323313233'); // Vector de inicializacion
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(text_plain), key,
                                         {
                                         keySize: 128 / 8, // Longitud de la llave de 128 bits
                                         iv: iv, //vector de inicializacion
                                         mode: CryptoJS.mode.CBC, //modo de cifrado
                                         padding: CryptoJS.pad.Pkcs7
                                         });
    
    return encrypted.toString();
},
activarDesactivarBtnLogin: function () {
    var txtpass = $('#txt_clave').val();
    var txtuser = $('#txt_usuario').val();
    
    if (txtpass == "" && txtuser == "") {
        $('#btn_login').addClass("btn_login_inactivo");
    }
    else {
        $('#btn_login').addClass("btn_login_activo");
    }
},
calcularCantidadPago: function (cantidadLabor, cantidadCastigo) {
    if (cantidadLabor != "" && cantidadCastigo != "") {
        if (parseFloat(cantidadLabor) < 0 || parseFloat(cantidadCastigo) < 0) {
            alert("Las cantidades tienen que ser mayor a cero", "");
            $("#inp_cantidad_labor").val(1);
            $("#inp_cantidad_castigo").val(0);
            return;
        }
        if (parseFloat(cantidadLabor) > parseFloat(cantidadCastigo)) {
            $("#inp_cantidad_pago").val(parseFloat(cantidadLabor) - parseFloat(cantidadCastigo));
        }
        else {
            $("#inp_cantidad_castigo").val(0);
            $("#inp_cantidad_pago").val($("#inp_cantidad_labor").val());
            //$("#guardarPaso2").removeClass().addClass("boton-guardar-inactive");
            alert("Cantidad de castigo no puede ser igual o mayor que la cantidad de labor", "");
        }
        
    }
},
seleccionarOpcionMenu: function (opc) {
    var opciones_botones = ["nav_asistencias", "nav_actividades", "nav_reportes", "nav_configuraciones"];
    for (var i = 0; i < opciones_botones.length; i++)
    {
        if (opciones_botones[i] == opc)
        {
            $("#" + opc).removeClass(opc + "_inactive").addClass(opc + "_active");
        }
        else
        {
            $("#" + opciones_botones[i]).removeClass(opciones_botones[i] + "_active").addClass(opciones_botones[i] + "_inactive");
        }
    }
},
    /*
     actualizarEstadoConexion: function () {
     
     var red = navigator.connection.type;
     
     var states = {};
     states[Connection.UNKNOWN] = 'Unknown connection';
     states[Connection.ETHERNET] = 'Ethernet connection';
     states[Connection.WIFI] = 'WiFi connection';
     states[Connection.CELL_2G] = 'Cell 2G connection';
     states[Connection.CELL_3G] = 'Cell 3G connection';
     states[Connection.CELL_4G] = 'Cell 4G connection';
     states[Connection.CELL] = 'Cell generic connection';
     states[Connection.NONE] = 'No network connection';
     if (states[red] === 'No network connection') {
     funciones.estadoConexion = false;
     } else {
     funciones.estadoConexion = true;
     }
     },*/
ocultarMostrarBloqueoPantalla: function (tipo, oper) {
    if ($("#block_screen").hasClass("hide") == true && oper == "bloquear") {
        $("#block_screen").removeClass();
        $("#contenedor_general").addClass("blur-fondo");
        $("#titulo_barra_progreso").html("Sincronizando...");
        if (tipo == "barra") {
            $("#contenedor_barra_progreso").removeClass();
        }
        else if (tipo == "autenticar") {
            $("#titulo_barra_progreso").html("Autenticando...");
        }
    }
    else {
        $("#contenedor_general").removeClass("hide blur-fondo");
        $("#block_screen").addClass('hide');
        $("#contenedor_barra_progreso").addClass("hide");
        $("#progreso").css("width", "0%");
        $("#progreso").css("background-color", "#94c948");
        $("#porcentaje").text("0%");
    }
},
limpiarFormularioAsistencia: function (opc) {
    if (opc == "borradofull") {
        $("#select_tipo_asistencia option:first").attr('selected', 'selected');
        $("#inp_contratista").val("");
        $("#inp_capataz").val("");
        $("#inp_cuadrilla").val("");
        $("#inp_ruma").val(0);
        $("#inp_empleado").val("");
        funciones.contratista.dataAsistencia.codigo = "";
        funciones.contratista.dataAsistencia.nombre = "";
        
        funciones.capataz.dataAsistencia.cedula = "";
        funciones.capataz.dataAsistencia.ficha = "";
        funciones.capataz.dataAsistencia.nombre = "";
        
        funciones.empleados.dataAsistencia.cedula = "";
        funciones.empleados.dataAsistencia.ficha = "";
        funciones.empleados.dataAsistencia.nombre = "";
        $("#btn_finalizar_asistencia").val("Nuevo");
        $("#btn_agregar_asistencia").val("Agregar");
        
        funciones.asistencia.dataCargada.Id_Asistencia = 0;
        funciones.asistencia.tieneActividad = false;
    }
    else {
        $("#inp_empleado").val("");
        funciones.empleados.dataAsistencia.cedula = "";
        funciones.empleados.dataAsistencia.ficha = "";
        funciones.empleados.dataAsistencia.nombre = "";
    }
    $("#btn_agregar_asistencia").removeClass().addClass("boton_agregar_inactivo");
    //$("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar_inactivo");
},
limpiarFormularioActividades: function () {
    $("#inp_ordenServicio").val("");
    $("#inp_actividad").val("");
    $("#inp_contratistaDGA").val("");
    $("#inp_plantio").val("");
    $("#inp_cuadro").val("");
    $("#inp_area_labor").val("");
    $("#inp_capatazDGA").val("");
    $("#inp_cuadrillaDGA").val("");
    $("#txt_observaciones").val("");
    $("#btn_agregar_datos_generales").removeClass().addClass("boton_agregar_inactivo");
    $("#sl_actividades").empty();
    
    funciones.plantio.data.areaPlantio = 0;
    funciones.plantio.data.codigo = "";
    funciones.plantio.data.nombre = "";
    funciones.labores.data.codigo = "";
    funciones.labores.data.nombre = "";
    funciones.contratista.dataActividad.codigo = "";
    funciones.contratista.dataActividad.nombre = "";
    funciones.capataz.dataActividad.cedula = "";
    funciones.capataz.dataActividad.ficha = "";
    funciones.capataz.dataActividad.nombre = "";
    
},
limpiarFormularioActividadesEmpleado: function () {
    $("#inp_cantidad_produccion").val("0");
    $("#inp_empleadoDE").val("");
    $("#inp_rumaDE").val("");
    $("#inp_cco").val("");
    $("#inp_cc").val("");
    $("#inp_cantidad_labor").val("1");
    $("#inp_cantidad_castigo").val("0");
    $("#inp_cantidad_pago").val("1");
    $("#inp_alimento").prop('checked', false);
    $("#btn_agregar_empleados").removeClass().addClass("boton_agregar_inactivo");
    $("#btn_finalizar_empleados").removeClass().addClass("boton_agregar_inactivo");
    $("#btn_finalizar_empleados").val("Finalizar");
    $("#btn_agregar_empleados").val("Agregar");
    funciones.empleados.dataEmpleadoActividad.ficha = "";
    funciones.empleados.dataEmpleadoActividad.cedula = "";
    funciones.empleados.dataEmpleadoActividad.nombre = "";
    funciones.CentroCosto.data.codigo = "";
    funciones.CentroCosto.data.nombre = "";
    funciones.cuentas.data.codigo = "";
    funciones.cuentas.data.nombre = "";
    funciones.actividadEmpleado.data = {};
    //funciones.plantio.data.unidadProduccion = "";
    funciones.plantio.data.cantidadProduccion = "0";
},
validarFormularioAsistencia: function () {
    if($("#select_tipo_asistencia").val()!="" &&  $("#inp_contratista").val()!="" && funciones.contratista.dataAsistencia.codigo!=""
       &&  $("#inp_capataz").val()!="" && funciones.capataz.dataAsistencia.ficha!="" && $("#inp_cuadrilla").val()!="" && $("#inp_ruma").val()!="" && $("#inp_empleado").val()!="" && funciones.empleados.dataAsistencia.ficha!="")
    {
        $("#btn_agregar_asistencia").removeClass().addClass("boton_agregar");
        return true;
        
        //$("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar");
    }
    else
    {
        $("#btn_agregar_asistencia").removeClass().addClass("boton_agregar_inactivo");
        return false;
        //$("#btn_finalizar_asistencia").removeClass().addClass("boton_agregar_inactivo");
    }
},
validarDecimal:function(dato){

    var esValida=false;
    
    var regex_dec = /^[0-9]{1,8}\.[0-9]{1,2}$/;
    var regex_ent=  /^[0-9]{1,8}$/;
    
    if ( regex_dec.test(dato) ||  regex_ent.test(dato) ) {
        console.log("Cumple...");
        esValida=true;
    }
    else{
        console.log("NO Cumple...");
        esValida=false;
    }
    
    return esValida;
    
}
,
validarFormularioActividades: function () {
    
    //$("#inp_area_labor").val() != "" && $("#inp_area_labor").val() != "0"
    var AreaLabor=$("#inp_area_labor").val();
    var esValida_AreaLabor=funciones.generales.validarDecimal(AreaLabor);
    
    
    if($("#inp_ordenServicio").val()!="" && funciones.plantio.data.codigo!="" && $("#inp_cuadro").attr("data-cuadro") !="" && $("#inp_actividad").val()!="" &&
       funciones.labores.data.codigo!="" && $("#inp_contratistaDGA").val()!="" && funciones.contratista.dataActividad.codigo!="" &&
       $("#inp_capatazDGA").val() != "" && funciones.capataz.dataActividad.ficha != "" && esValida_AreaLabor
       && $("#inp_cuadrillaDGA").val() != "")
    {
        
        $("#btn_agregar_datos_generales").removeClass().addClass("boton_agregar");
    }
    else
    {
        $("#btn_agregar_datos_generales").removeClass().addClass("boton_agregar_inactivo");
    }
},
validarFormularioDatosEmpleados: function () {
    
    // $("#inp_cantidad_labor").val()!="" && $("#inp_cantidad_labor").val()!="0" && $("#inp_cantidad_castigo").val()!="" &&
    // $("#inp_cantidad_pago").val()!="" && $("#inp_cantidad_pago").val()!="0"
    var CantidadLabor   =   $("#inp_cantidad_labor").val();
    var CantidadCastigo =   $("#inp_cantidad_castigo").val();
    
    var esValida_CantidadLabor   = funciones.generales.validarDecimal(CantidadLabor);
    var esValida_CantidadCastigo = funciones.generales.validarDecimal(CantidadCastigo);
    
    var esValidaCantidadProduccion = true;
    
    if($('.contenedor_cantidad_produccion').hasClass('hide') == false && $('#inp_cantidad_produccion').val()==0){
        esValidaCantidadProduccion = false;
        
    }
    
    
    if($("#inp_empleadoDE").val()!="" && funciones.empleados.dataEmpleadoActividad.ficha!="" && $("#inp_rumaDE").val()!="" && esValida_CantidadLabor &&  esValida_CantidadCastigo &&
      esValidaCantidadProduccion && ( funciones.asistencia.dataCargada.Presencia_Pegue>0 || funciones.usuarios.data.AsistenciaOpcional == 1) )
    {
        $("#btn_agregar_empleados").removeClass().addClass("boton_agregar");
        $("#btn_finalizar_empleados").removeClass().addClass("boton_agregar");
        return true;
    }
    else
    {
        $("#btn_agregar_empleados").removeClass().addClass("boton_agregar_inactivo");
        $("#btn_finalizar_empleados").removeClass().addClass("boton_agregar_inactivo");
        return false;
    }
},
desplazarPantalla: function (opc) {
    if ($("#form_asistencia").hasClass("hide") == false && $("#form_asistencia").css("margin-bottom") == "0px") {
        $("#form_asistencia").css({ marginBottom: "50vh" });
        $("#inp_empleado").addClass("hide");
        $(".contenedor_general").animate({ scrollTop: 300 }, 1000, function () {
                                         $("#inp_empleado").removeClass("hide");
                                         });
    }
    else if ($("#form_asistencia").hasClass("hide") == false && opc == "cerrar")
    {
        $("#inp_empleado").blur();
        $(".contenedor_general").animate({ scrollTop: 0 }, 1000);
        $("#form_asistencia").css({ marginBottom: "0" });
    }
},
transicionPantalla: function (origen, destino) {
    $(".contenedor_general").scrollTop(0);
    if (origen == "contenedor_login")
    {
        $('#loader-login').addClass('hide');
        $('.formulario_login>div').removeClass("login_cargando");
        $("#nav_botones").removeClass();
        $("#hd_cabecera").removeClass();
    }
    else if (destino == "contenedor_login")
    {
        $("#nav_botones").addClass("hide");
        $("#hd_cabecera").addClass("hide");
        $("#contenedor_general>form").addClass("hide");
        $("#form_asistencia").removeClass();
    }
    
    if (destino != "form_datos_empleados")
    {
        $("#span_retroceder").addClass("hide");
        $("#span_eliminar_actividad").addClass("hide")
    }
    if (destino == "form_asistencia" && $("#btn_agregar_asistencia").val()=="Actualizar")
    {
        $("#span_eliminar_actividad").removeClass("hide");
    }
    
    if (origen == "form_datos_empleados"  && contenedorEmp == "form_datos_empleados")
    {
        $("#" + contenedorEmp).addClass("hide");
        origen = contenedorEmp;
    }
    else
    {
        $("#" + origen).addClass("hide");
    }
    
    if ((destino == "form_generales_apunte" || destino == "form_datos_empleados") && contenedorEmp == "form_datos_empleados")
    {
        $("#h1_cabecera").html("Datos Empleados");
        if ($("#btn_agregar_empleados").val() == "Actualizar")
        {
            $("#span_eliminar_actividad").removeClass("hide");
        }
        else
        {
            $("#span_retroceder").removeClass("hide");
        }
        
        $("#" + contenedorEmp).removeClass("hide");
    }
    else
    {
        $("#" + destino).removeClass("hide");
    }
    
    if (destino == "contenedor_general")
    {
        contenedorActual = "form_asistencia";
    }
    else
    {
        contenedorActual = destino;
    }
    
    
},
transicionTab: function (origen, destino) {
    $("#" + origen.split("_")[1]).addClass("hide");
    $("#" + destino.split("_")[1]).removeClass("hide");
},
notificarFinSincronizacion: function (maestros) {
    porcentajeCompletado += 14;
    $("#progreso").css("background-color", "#94c948");
    $("#progreso").css("width", porcentajeCompletado + "%");
    if (porcentajeCompletado > 50) {
        $("#porcentaje").css("color", "#fff");
    }
    $("#porcentaje").text(porcentajeCompletado.toFixed(2) + "%");
    if (maestros == TOTAL_MAESTROS) {
        funciones.generales.ocultarMostrarBloqueoPantalla("", "desbloquear");
        
        porcentajeCompletado = 0;
        db_Labores.maestros = 0;
    }
},
sincronizar_maestros: function () {
    
    confirm("Está seguro que desea sincronizar los maestros?", "", function(btnIndex) {
            
            if (btnIndex == 1) {
            if (navigator.onLine == true) {
            
            
            //Limpia la variable global de ingreso al detalle de empleado, para que una vez se sincronice, siempre envie a la pantalla de la ultima cabecera(Esto evitaria los nulos).
            contenedorEmp = "";
            funciones.generales.limpiarFormularioActividadesEmpleado();
            
            funciones.generales.ocultarMostrarBloqueoPantalla("barra", "bloquear");
            $("#titulo_barra_progreso").innerText = "Conectando...";
            //Obtener Empresa
            var req_compania =  $.ajax({
                                       type: 'GET',
                                       url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=AuthenticateUser',
                                       data: "dispositivo=" + funciones.dispositivoID + "&user=" + funciones.usuarios.data.nombre + "&version=" + Version_app + "&password=" + encodeURIComponent(funciones.usuarios.data.clave),
                                       timeout: TIMEOUT_CONSULTAS,
                                       dataType: 'JSON',
                                       success: function(data) {
                                       // if(data.Exito){
                                       db_Labores.limpiar_tabla("Sincronizaciones");
                                       db_Labores.limpiar_tabla("Empresa");
                                       db_Labores.insertar_empresa(data.Resultado[0].Compania);
                                       funciones.empresa = data.Resultado[0].Compania;
                                       db_Labores.insertar_sincronizacion();
                                       obtenerMaestros();
                                       //}

                                       if(data.Exito == false)
                                       {
                                        alert(data.MensajeError,"");
                                       }
                                       
                                        var bajoDatos=true;
                                        funciones.usuarios.configurarUI(data,bajoDatos);
                                       
                                       },
                                       error: function( jqXHR, textStatus, errorThrown ){
                                       funciones.generales.ocultarMostrarBloqueoPantalla("", "desbloquear");
                                       porcentajeCompletado = 0;
                                       db_Labores.maestros = 0;
                                       console.log(jqXHR);
                                       if (jqXHR.statusText == "timeout"){
                                       alert("Hay problemas de conexion, favor intente mas tarde.","");
                                       }
                                       else{
                                              alert(jqXHR.responseJSON.MensajeError, "");
                                       }
                                       
                                       }
                                       });
            
            
            }
            else {
            alert("No hay conexion al servidor", "");
            }
            }
            
            });
    
    
},
formatearFecha: function (fecha) {
    var arrayFecha = fecha.split("-");
    var meses = new Array("","Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic");
    //return fecha.getDate()+"/"+meses[parseInt(fecha.getMonth())]+"/"+fecha.getFullYear();
    return arrayFecha[2] + "/" + meses[parseInt(arrayFecha[1])] + "/" + arrayFecha[0];
    
},
HoraCompleta:function(fecha,completa){
    
    anio=fecha.getFullYear();
    mes=parseInt(fecha.getMonth()+1);
    dia=parseInt(fecha.getDate());
    hora=parseInt(fecha.getHours());
    minuto=parseInt(fecha.getMinutes());
    segundo=parseInt(fecha.getSeconds());
    mes=(mes < 10 ? '0' : '')+""+mes;
    dia=(dia < 10 ? '0' : '')+""+dia;
    hora=(hora < 10 ? '0' : '')+""+hora;
    minuto=(minuto < 10 ? '0' : '')+""+minuto;
    segundo=(segundo < 10 ? '0' : '')+""+segundo;
    if(completa){
        return anio+"-"+mes+"-"+dia+" "+hora+":"+minuto+":"+segundo;
    }
    else{
        return anio+"-"+mes+"-"+dia;
    }
},
sincronizar_apuntes: function (asistencia, actividades, actividades_empleados) {
    //Limpia la variable global de ingreso al detalle de empleado, para que una vez se sincronice, siempre envie a la pantalla de la ultima cabecera(Esto evitaria los nulos).
    contenedorEmp = "";
    funciones.generales.limpiarFormularioActividadesEmpleado();
    var tmp_fecha_actividad = "", tmp_plantio = "", tmp_cuadro = "", tmp_labor = "", tmp_cuadrilla = "", tmp_contratista = "", tmp_capataz = "";
    var Asistencias_X_Empleados = [];
    var Actividades_X_Plantios = [];
    var Actividades_X_Empleados = [];
    var Empleados = [];
    var Credenciales = {
    Usuario: funciones.usuarios.data.nombre,
    Contrasena: funciones.usuarios.data.clave,
    ID_Dispositivo:funciones.dispositivoID,
    Version_app:Version_app
    }
    for(var i=0;i<asistencia.length;i++)
    {
        Asistencias_X_Empleados.push({
                                     ASE_Dispositivo_Registro_ID: asistencia[i].item.Id_Asistencia,
                                     ASE_Fecha_Asistencia: asistencia[i].item.Fecha_Asistencia,
                                     ASE_Contratista: asistencia[i].item.Codigo_Contratista,
                                     ASE_Capataz: asistencia[i].item.Codigo_Capataz,
                                     ASE_Cuadrilla: asistencia[i].item.Cuadrilla,
                                     ASE_Ruma: asistencia[i].item.Ruma,
                                     ASE_Empleado: asistencia[i].item.Ficha_Empleado,
                                     ASE_Presencia_Control: asistencia[i].item.Presencia_Control,
                                     ASE_Presencia_Pegue:asistencia[i].item.Presencia_Pegue,
                                     ASE_Usuario_Modificacion: asistencia[i].item.Usuario,
                                     ASE_Fecha_Modificacion: asistencia[i].item.Fecha,
                                     ASE_ID: asistencia[i].item.ID_Transaccion,
                                     ASE_Control_Escaneado:asistencia[i].item.Control_Escaneado,
                                     ASE_Pegue_Escaneado:asistencia[i].item.Pegue_Escaneado,
                                     ASE_Activo: (asistencia[i].item.Estado==3?0:1)
                                     
                                     });
    }
    for(var i=0;i<actividades.length;i++)
    {
        
        Actividades_X_Plantios.push({
                                    AXP_Dispositivo_Registro_ID: actividades[i].item.Id_Actividad,
                                    AXP_Fecha_Actividad: actividades[i].item.Fecha_Actividad,
                                    AXP_Plantio: actividades[i].item.Codigo_Plantio,
                                    AXP_Cuadro: actividades[i].item.Cuadro,
                                    AXP_Area_Labor: actividades[i].item.Area_labor,
                                    // Codigo_Labor: actividades[i].item.Codigo_Actividad,
                                    AXP_Contratista: actividades[i].item.Codigo_Contratista,
                                    AXP_Capataz: actividades[i].item.Codigo_Capataz,
                                    AXP_Cuadrilla:actividades[i].item.Cuadrilla,
                                    AXP_Observaciones: actividades[i].item.Observaciones,
                                    AXP_Usuario_Modificacion: actividades[i].item.Usuario,
                                    AXP_Dispositivo_Fecha_Transaccion: actividades[i].item.Fecha,
                                    AXP_ID: actividades[i].item.ID_Transaccion,
                                    OS: actividades[i].item.Orden_Servicio
                                    });
    }
    for(var i=0;i<actividades_empleados.length;i++)
    {
        
        Actividades_X_Empleados.push({
                                     AXE_Dispositivo_Registro_ID: actividades_empleados[i].item.Id_Actividad_Empleado,
                                     AXP_Dispositivo_Registro_ID: actividades_empleados[i].item.Id_Actividad,
                                     AXP_Actividad: actividades_empleados[i].item.Codigo_Actividad,
                                     AXE_Empleado: actividades_empleados[i].item.Ficha_Empleado,
                                     AXE_Ruma: actividades_empleados[i].item.Ruma,
                                     AXE_Centro_Costo: actividades_empleados[i].item.Codigo_CCO,
                                     AXE_Cuenta_Contable: actividades_empleados[i].item.Codigo_CC,
                                     Dispositivo_Cantidad_Actividad: actividades_empleados[i].item.Cantidad_Actividad,
                                     Dispositivo_Cantidad_Castigo: actividades_empleados[i].item.Cantidad_Castigo,
                                     //  Cantidad_Pago: actividades_empleados[i].item.Cantidad_Pago,
                                     Dispositivo_Alimento_Recibido: actividades_empleados[i].item.Alimento_Recibido,
                                     AXE_Usuario_Modificacion: actividades_empleados[i].item.Usuario,
                                     AXE_Dispositivo_Fecha_Transaccion: actividades_empleados[i].item.Fecha,
                                     AXE_ID: actividades_empleados[i].item.ID_Transaccion,
                                     AXP_ID: actividades_empleados[i].item.Id_Actividad_Plantio,
                                     AXE_Empleado_Escaneado:actividades_empleados[i].item.Empleado_Escaneado,
                                     AXE_Activo:(actividades_empleados[i].item.Estado==3?0:1),
                                     AXE_UDM:actividades_empleados[i].item.Unidad_Produccion,
                                     AXE_UDM_Cantidad:actividades_empleados[i].item.Cantidad_Produccion
                                     });
    }
    
    
    if(Actividades_X_Empleados.length>0 ||Asistencias_X_Empleados.length >0){
        
        //Consolea datos enviados al servicio...
        console.log(JSON.stringify({ Credenciales: Credenciales, Asistencias_X_Empleados: Asistencias_X_Empleados, Actividades_X_Plantios: Actividades_X_Plantios, Actividades_X_Empleados:Actividades_X_Empleados}));
        
        $.ajax({
               type: 'POST',
               url: services.host + '/AgroIndustria/Labores/ALA/Labores/InsertarApuntesLabores',
               headers: { "Content-type": "application/json;" },
               data: JSON.stringify({ Credenciales: Credenciales, Asistencias_X_Empleados: Asistencias_X_Empleados, Actividades_X_Plantios: Actividades_X_Plantios, Actividades_X_Empleados:Actividades_X_Empleados}),
               timeout: TIMEOUT_INSERCION,
               dataType: 'JSON',
               success: function (response) {
               
               var error_asistencia = 0;
               var error_actividad = 0;
               var error_actividad_empleado = 0;
               
               respuesta_ws_gb= response;
               if(response.Resultado.Asistencias_X_Empleados.length > 0){
               for(var i=0;i<response.Resultado.Asistencias_X_Empleados.length;i++) {
               //Valida exito de Asistencias_X_Empleados objecto a objeto...
               if(response.Resultado.Asistencias_X_Empleados[i].Exito==true){
               //Actualiza registro...
               if(response.Resultado.Asistencias_X_Empleados[i].Activo==1){
               db_Labores.actualizar_estados(1, response.Resultado.Asistencias_X_Empleados[i].Id_Asistencia_Empleado, "Asistencia");
               db_Labores.actualizar_id_transaccion(response.Resultado.Asistencias_X_Empleados[i].Id_Asistencia_Empleado, response.Resultado.Asistencias_X_Empleados[i].Id_Insertado, "Asistencia");
               }
               else{
               //Borra registro...
               db_Labores.borrar_asistencia(response.Resultado.Asistencias_X_Empleados[i].Id_Asistencia_Empleado);
               }
               
               }
               else{
               error_asistencia++;
               }
               }
               
               }
               for(var i=0;i<response.Resultado.Actividades_X_Plantios.length;i++) {
               //Valida exito de Actividades_X_Plantio objeto a objeto...
               if(response.Resultado.Actividades_X_Plantios[i].Exito==true){
               //Actualiza registro...
               if(response.Resultado.Actividades_X_Plantios[i].Activo==1){
               db_Labores.actualizar_estados(1, response.Resultado.Actividades_X_Plantios[i].Id_Actividad_Plantio, "Actividades");
               db_Labores.actualizar_id_transaccion(response.Resultado.Actividades_X_Plantios[i].Id_Actividad_Plantio, response.Resultado.Actividades_X_Plantios[i].Id_Insertado, "Actividades");
               }else{
               
               }
               }
               else{
               error_actividad++;
               }
               }
               for (var i = 0; i<response.Resultado.Actividades_X_Empleados.length; i++) {
               //Valida exito de Actividades_X_Empleados objeto a objeto...
               if(response.Resultado.Actividades_X_Empleados[i].Exito==true){
               if(response.Resultado.Actividades_X_Empleados[i].Activo==1){
               db_Labores.actualizar_estados(1, response.Resultado.Actividades_X_Empleados[i].Id_Actividad_Empleado, "Actividades_Empleados");
               db_Labores.actualizar_id_transaccion(response.Resultado.Actividades_X_Empleados[i].Id_Actividad_Empleado, response.Resultado.Actividades_X_Empleados[i].Id_Insertado, "Actividades_Empleados");
               }
               else{
               db_Labores.borrar_actividad(response.Resultado.Actividades_X_Empleados[i].Id_Actividad_Empleado);
               }
               
               }
               else{
               error_actividad_empleado++;
               }
               }
               funciones.generales.ocultarMostrarBloqueoPantalla("", "desbloquear");
               
               if (error_actividad_empleado == 0 & error_actividad == 0 & error_asistencia == 0){
               alert("Datos enviados correctamente", "");
               }
               else{
               
               var error_str ="";
               
               if (error_actividad_empleado >0){
               error_str += "Ocurrio error en " + error_actividad_empleado + " registros de actividades de empleados.\n";
               }
               if (error_actividad >0){
               error_str += "Ocurrio error en " + error_actividad + " registros de actividades.\n";
               }
               if (error_asistencia >0){
               error_str += "Ocurrio error en " + error_asistencia + " registros de asistencia de empleados.\n";
               }
               error_str += "Estos datos quedan pendientes y se enviaran en el proximo intento.";
               
               alert(error_str, "");
               }
               
               
               },
               error: function (response) {
               alert(response.responseJSON.MensajeError, "");
               funciones.generales.ocultarMostrarBloqueoPantalla("", "desbloquear");
               }
               });
        
        
    }
    else{
        alert("No hay datos pendientes de enviar.", "");
        funciones.generales.ocultarMostrarBloqueoPantalla("", "desbloquear");
    }
    
},
mapear_apuntes_borrar: function(asistencia, actividades_empleados){
    var Asistencias_X_Empleados = [];
    var Actividades_X_Empleados = [];
    
    var borrados={
    Asistencias_X_Empleados:[],
    Actividades_X_Empleados:[]
    };
    
    for (var i = 0; i < asistencia.length; i++) {
        
        borrados.Asistencias_X_Empleados.push({
                                              ASE_ID: asistencia[i].item.ID_Transaccion,
                                              ASE_Fecha_Asistencia: asistencia[i].item.Fecha_Asistencia,
                                              ASE_Contratista: asistencia[i].item.Codigo_Contratista,
                                              ASE_Capataz: asistencia[i].item.Codigo_Capataz,
                                              ASE_Cuadrilla: asistencia[i].item.Cuadrilla,
                                              ASE_Ruma: asistencia[i].item.Ruma,
                                              ASE_Empleado: asistencia[i].item.Ficha_Empleado,
                                              ASE_Presencia_Control: asistencia[i].item.Presencia_Control,
                                              ASE_Presencia_Pegue: asistencia[i].item.Presencia_Pegue,
                                              ASE_Usuario_Modificacion: asistencia[i].item.Usuario,
                                              ASE_Fecha_Modificacion: asistencia[i].item.Fecha
                                              
                                              });
        
    }
    for (var i = 0; i < actividades_empleados.length; i++) {
        
        
        borrados.Actividades_X_Empleados.push({
                                              AXE_Dispositivo_Registro_ID: actividades_empleados[i].item.Id_Actividad_Empleado,
                                              AXP_Dispositivo_Registro_ID: actividades_empleados[i].item.Id_Actividad,
                                              AXP_Actividad: actividades_empleados[i].item.Codigo_Actividad,
                                              AXE_Empleado: actividades_empleados[i].item.Ficha_Empleado,
                                              AXE_Ruma: actividades_empleados[i].item.Ruma,
                                              AXE_Centro_Costo: actividades_empleados[i].item.Codigo_CCO,
                                              Dispositivo_Cantidad_Actividad: actividades_empleados[i].item.Cantidad_Actividad,
                                              Dispositivo_Cantidad_Castigo: actividades_empleados[i].item.Cantidad_Castigo,
                                              Dispositivo_Alimento_Recibido: actividades_empleados[i].item.Alimento_Recibido,
                                              AXE_Usuario_Modificacion: actividades_empleados[i].item.Usuario,
                                              AXE_Dispositivo_Fecha_Transaccion: actividades_empleados[i].item.Fecha
                                              });
        
    }
    
    return borrados;
},
sincronizar_apuntes_borrar: function (asistencia, actividades_empleados) {
    var tmp_fecha_actividad = "", tmp_plantio = "", tmp_cuadro = "", tmp_labor = "", tmp_cuadrilla = "", tmp_contratista = "", tmp_capataz = "";
    var Asistencias_X_Empleados = [];
    var Actividades_X_Plantios = [];
    var Actividades_X_Empleados = [];
    var Empleados = [];
    
    var Credenciales = {
    Usuario: funciones.usuarios.data.nombre,
    Contrasena: funciones.usuarios.data.clave,
    ID_Dispositivo:funciones.dispositivoID,
    Version_app:Version_app
    }
    for (var i = 0; i < asistencia.length; i++) {
        
        Asistencias_X_Empleados.push({
                                     ASE_ID: asistencia[i].item.ID_Transaccion,
                                     ASE_Fecha_Asistencia: asistencia[i].item.Fecha_Asistencia,
                                     ASE_Contratista: asistencia[i].item.Codigo_Contratista,
                                     ASE_Capataz: asistencia[i].item.Codigo_Capataz,
                                     ASE_Cuadrilla: asistencia[i].item.Cuadrilla,
                                     ASE_Ruma: asistencia[i].item.Ruma,
                                     ASE_Empleado: asistencia[i].item.Ficha_Empleado,
                                     ASE_Presencia_Control: asistencia[i].item.Presencia_Control,
                                     ASE_Presencia_Pegue: asistencia[i].item.Presencia_Pegue,
                                     ASE_Usuario_Modificacion: asistencia[i].item.Usuario,
                                     ASE_Fecha_Modificacion: asistencia[i].item.Fecha
                                     
                                     });
        
    }
    for (var i = 0; i < actividades_empleados.length; i++) {
        
        
        Actividades_X_Empleados.push({
                                     AXE_Dispositivo_Registro_ID: actividades_empleados[i].item.Id_Actividad_Empleado,
                                     AXP_Dispositivo_Registro_ID: actividades_empleados[i].item.Id_Actividad,
                                     AXP_Actividad: actividades_empleados[i].item.Codigo_Actividad,
                                     AXE_Empleado: actividades_empleados[i].item.Ficha_Empleado,
                                     AXE_Ruma: actividades_empleados[i].item.Ruma,
                                     AXE_Centro_Costo: actividades_empleados[i].item.Codigo_CCO,
                                     Dispositivo_Cantidad_Actividad: actividades_empleados[i].item.Cantidad_Actividad,
                                     Dispositivo_Cantidad_Castigo: actividades_empleados[i].item.Cantidad_Castigo,
                                     Dispositivo_Alimento_Recibido: actividades_empleados[i].item.Alimento_Recibido,
                                     AXE_Usuario_Modificacion: actividades_empleados[i].item.Usuario,
                                     AXE_Dispositivo_Fecha_Transaccion: actividades_empleados[i].item.Fecha
                                     });
        
    }
    
    if(Asistencias_X_Empleados.length >0){
        
        $.ajax({
               type: 'POST',
               url: services.host + '/AgroIndustria/Labores/ALA/Labores/EliminarAsistencias',
               headers: { "Content-type": "application/json;" },
               data: JSON.stringify({ Credenciales: Credenciales,Data: Asistencias_X_Empleados}),
               timeout: 10000,
               dataType: 'JSON',
               success: function (response) {
               if (response == 1)
               {
               db_Labores.borrar_datos_pendientes("Asistencia");
               alert("Registros de asistencia eliminados correctamente.","");
               }
               
               },
               error: function (response) {
               alert("Ocurrió un error al tratar de enviar la información a borrar de asistencia", "");
               }
               });
    }
    
    if(Actividades_X_Empleados.length >0){
        
        $.ajax({
               type: 'POST',
               url: services.host + '/AgroIndustria/Labores/ALA/Labores/EliminarActividades',
               headers: { "Content-type": "application/json;" },
               data: JSON.stringify({ Credenciales: Credenciales, Data: Actividades_X_Empleados }),
               timeout: TIMEOUT_INSERCION,
               dataType: 'JSON',
               success: function (response) {
               if (response == 1)
               {
               db_Labores.borrar_datos_pendientes("Actividades_Empleados");
               alert("Registros eliminados correctamente.","");
               }
               
               
               },
               error: function (response) {
               alert("Ocurrió un error al tratar de enviar la información a borrar de actividades", "");
               }
               });
    }
    
    
},
cargarReporteRuma: function (data) {
    var temp_ruma = "";
    var lista = "";
    var cabecera_lista = "";
    var cabecera_detalle_lista = "";
    var detalle_lista = "";
    var detalle_sublista = "";
    var total_ruma = 0;
    $("#ul_ruma_reporte").html("");
    if (data.length > 0)
    {
        for (var i = 0; i < data.length; i++) {
            if (temp_ruma != data[i].item.Ruma) {
                cabecera_lista = '<div class="cabecera_ruma plegada">' +
                '<label>' + data[i].item.Ruma + '</label>' +
                '<label>totalRuma</label>' +
                '</div>';
            }
            detalle_sublista += '<li>' +
            '<div class="col_izquierda">' +
            '<p class="p_capataz_cuadrilla">' + data[i].item.Cuadrilla + '-' + data[i].item.Codigo_Capataz + '</p>' +
            '<small class="small_contratista">' + data[i].item.Codigo_Contratista + '</small>' +
            '</div>' +
            '<div class="col_derecha">' +
            '<label class="lb_col_promedio">' + data[i].item.Promedio.toFixed(2) + '</label>' +
            '<label class="lb_col_empleados">' + data[i].item.Empleados + '</label>' +
            '<label class="lb_col_total">' + data[i].item.Actividades.toFixed(2) + '</label>' +
            '</div>' +
            '</li>';
            
            total_ruma += data[i].item.Actividades;
            temp_ruma = data[i].item.Ruma;
            if (data[i + 1] == undefined || temp_ruma != data[i + 1].item.Ruma) {
                detalle_lista = '<div class="detalle_ruma hide">' +
                '<div class="cabecera_detalle_ruma">' +
                '<label class="lb_col_capataz">Capataz</label>' +
                '<label class="lb_col_promedio">Promedio</label>' +
                '<label class="lb_col_empleados">Empleados</label>' +
                '<label class="lb_col_total">Total</label>' +
                '</div>' +
                '<ul class="ul_detalle_ruma">' +
                detalle_sublista +
                '</ul>' +
                '</div>';
                
                detalle_sublista = "";
                cabecera_lista = cabecera_lista.replace("totalRuma", total_ruma.toFixed(2));
                lista += "<li class='li_ruma'>" + cabecera_lista + detalle_lista + "</li>";
                total_ruma = 0;
                cabecera_lista = "";
            }
            
            
        }
    }
    else
    {
        lista = "<span class='blank-state-asistencias'>No hay registros en la fecha del  " + funciones.generales.formatearFecha(fecha_general) + "</span>";
    }
    $("#ul_ruma_reporte").html(lista);
},
cargarReporteApunte: function (arr_apunte) {
    var temp_actividad = "";
    var cabecera_apunte = "";
    var lista_apunte = "";
    var detalle_apunte = "";
    var subdetalle_apunte = "";
    var total_apunte = 0;
    var class_estilo = "";
    if (arr_apunte.length > 0)
    {
        for (var i = 0; i < arr_apunte.length; i++) {
            if (arr_apunte[i].item.Cantidad_Castigo > 0)
            {
                class_estilo = "castigo";
            }
            else
            {
                class_estilo = "";
            }
            if (temp_actividad != arr_apunte[i].item.Codigo_Actividad) {
                cabecera_apunte = '  <div class="cabecera_apunte  plegada ">' +
                '<p>' + arr_apunte[i].item.Codigo_Actividad + '-' + arr_apunte[i].item.Nombre_Actividad + '</p>' +
                '<label>totalApunte</label>' +
                '</div>';
            }
            subdetalle_apunte += '<li>' +
            '<div class="col_izquierda">' +
            '<p class="p_empleado ' + class_estilo + '">' + arr_apunte[i].item.Nombre_Empleado + '</p>' +
            '<small class="small_fichaEmpleado ' + class_estilo + '">' + arr_apunte[i].item.Ficha_Empleado + '</small>' +
            '</div>' +
            '<div class="col_derecha '+class_estilo+'">' +
            '<span class="btn_editarApunte" data-id="' + arr_apunte[i].item.Id_Actividad_Empleado + '"></span>' +
            '<label class="cantidad_labor ' + class_estilo + '">' + arr_apunte[i].item.Cantidad_Actividad.toFixed(2) + '</label>' +
            '</div>' +
            '</li>';
            total_apunte += arr_apunte[i].item.Cantidad_Actividad;
            temp_actividad = arr_apunte[i].item.Codigo_Actividad;
            
            if (arr_apunte[i + 1] == undefined || temp_actividad != arr_apunte[i + 1].item.Codigo_Actividad) {
                cabecera_apunte = cabecera_apunte.replace("totalApunte", total_apunte.toFixed(2));
                detalle_apunte = '<ul class="detalle_apunte">' +
                subdetalle_apunte +
                '</ul>';
                lista_apunte += "<li>" + cabecera_apunte + detalle_apunte + "</li>";
                subdetalle_apunte = "";
                cabecera_apunte = "";
                total_apunte = 0;
            }
        }
    }
    else {
        lista_apunte = "<span class='blank-state-asistencias'>No hay registros en la fecha del  " + funciones.generales.formatearFecha(fecha_general) + "</span>";
    }
    $("#lista_apunte").html(lista_apunte);
},
cancelarEdicionAsistencia: function () {
    $(".contenedor_general").animate({ scrollTop: 0 }, 1000);
    funciones.generales.resetSelectTipoAsistencia();
    funciones.generales.limpiarFormularioAsistencia("borradofull");
    funciones.generales.transicionPantalla("form_asistencia", "form_reportes");
    funciones.generales.seleccionarOpcionMenu("nav_reportes");
},
cargarIdDispositivo: function () {
    window.plugins.uniqueDeviceID.get(function (uuid) {
                                      funciones.dispositivoID = uuid;
                                      $('.dispositivo_id').html('ID: ' + uuid);
                                      }, function () {
                                      alert("Ocurrio un error al tratar de obtener el ID del dispositivo", "");
                                      });
}
}
}
function alert(content, title) {
    navigator.notification.alert(content, null, "Aplicación de Labores", 'Ok');
}
function confirm(content, title, func) {
    navigator.notification.confirm(content, func, "Aplicación de Labores", ['Si', 'No']);
}
function toProperCase(s) {
    return s.toLowerCase().replace(/^(.)|\s(.)/g,
                                   function ($1) { return $1.toUpperCase(); });
}


function obtenerMaestros(){
    
    //Maestro Contratista
    var req_contratista = $.ajax({
                                 type: 'GET',
                                 url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=Obtener_Contratas',
                                 data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
                                 timeout: TIMEOUT_CONSULTAS,
                                 dataType: 'JSON',
                                 success: function(data) {
                                 document.getElementById("titulo_barra_progreso").innerText = "Procesando Registros...";
                                 db_Labores.limpiar_tabla("Contratista");
                                 var sup = [];
                                 for (i = 0; i < data.Resultado.length; i++) {
                                 sup.push({
                                          Codigo: data.Resultado[i].Codigo,
                                          Nombre: data.Resultado[i].Nombre,
                                          Grupo: data.Resultado[i].Grupo
                                          });
                                 }
                                 db_Labores.insertar_contratista(sup);
                                 }
                                 });
    
    //Maestro Supervisores
    var req_supervisor = $.ajax({
                                type: 'GET',
                                url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=Obtener_Supervisores',
                                data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
                                timeout: TIMEOUT_CONSULTAS,
                                dataType: 'JSON',
                                success: function(data) {
                                document.getElementById("titulo_barra_progreso").innerText = "Procesando Registros...";
                                db_Labores.limpiar_tabla("Supervisor");
                                var contrata = [];
                                for (i = 0; i < data.Resultado.length; i++) {
                                contrata.push({
                                              Codigo: data.Resultado[i].Codigo,
                                              Nombre: data.Resultado[i].Nombre
                                              });
                                }
                                db_Labores.insertar_supervisor(contrata);
                                }
                                });
 
    //Maestro Orden Servicios
    var req_orden_servicio = $.ajax({
                              type: 'GET',
                              url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=Obtener_OS',
                              data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
                              timeout: TIMEOUT_CONSULTAS,
                              dataType: 'JSON',
                              success: function(data) {
                              db_Labores.limpiar_tabla("Orden_Servicio");
                              var orden_servicios = [];
                              for (i = 0; i < data.Resultado.length; i++) {
                              orden_servicios.push({
                                            Codigo_Plantio: data.Resultado[i].Plantio,
                                            Plantio: data.Resultado[i].Plantio_N,
                                            Codigo_Cuadro: data.Resultado[i].Cuadro,
                                            Cuadro: data.Resultado[i].Cuadro_N,
                                            Orden_Servicio: data.Resultado[i].OS,
                                            Codigo_Actividad: data.Resultado[i].Actividad,
                                            Actividad: data.Resultado[i].Actividad_N,
                                            Area_Cuadro: data.Resultado[i].Area_Cuadro,
                                            UnidadProduccion: data.Resultado[i].UDM_Produccion,
                                            UnidadProduccionN: data.Resultado[i].UDM_Produccion_N,
                                            UnidadProduccionNCorto: data.Resultado[i].UDM_Produccion_Corto,
                                            UnidadPago: data.Resultado[i].UDM_Pago
                                            });
                              }
                              
                              db_Labores.insertar_orden_servicio(orden_servicios);
                              }
                              });
    
    //Maestro Centro Costos y Cuentas
    var req_cco = $.ajax({
                         type: 'GET',
                         url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=Obtener_Centros_Costos',
                         data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
                         timeout: TIMEOUT_CONSULTAS,
                         dataType: 'JSON',
                         success: function(data) {
                         db_Labores.limpiar_tabla("Centro_Costo");
                         db_Labores.limpiar_tabla("Cuentas");
                         var cco = [];
                         var cta = [];
                         
                         for (i = 0; i < data.Resultado.length; i++) {
                         
                         if(data.Resultado[i].esCentroCosto == 1){
                         cco.push({
                                  Codigo: data.Resultado[i].Codigo,
                                  Nombre: data.Resultado[i].Nombre
                                  });
                         }
                         else{
                         cta.push({
                                  Codigo: data.Resultado[i].Codigo,
                                  Nombre: data.Resultado[i].Nombre
                                  });
                         }
                    
                         }
                         db_Labores.insertar_centro_costo(cco);
                         db_Labores.insertar_cuenta(cta);
                         }
                         });
    
    //Maestro Empleados
    var req_empleados = $.ajax({
                               type: 'GET',
                               url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=Obtener_Empleados',
                               data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
                               timeout: TIMEOUT_CONSULTAS,
                               dataType: 'JSON',
                               success: function(data) {
                               db_Labores.limpiar_tabla("Empleados");
                               var empleado = [];
                               for (i = 0; i < data.Resultado.length; i++) {
                               empleado.push({
                                             Ficha: data.Resultado[i].Ficha,
                                             Nombre: data.Resultado[i].Nombre,
                                             Cedula: data.Resultado[i].Cedula
                                             })
                               }
                               db_Labores.insertar_empleados(empleado);
                               }
                               });
    
    //Informacion de version
    var req_version = $.ajax({
                             type: 'GET',
                             url: services.host + '/AgroIndustria/Labores/ALA/Labores?Metodo=Obtener_Version',
                             data: "cmp=" + funciones.empresa + "&user=" + funciones.usuarios.data.nombre + "&password=" + encodeURIComponent(funciones.usuarios.data.clave) + "&dispositivo=" + funciones.dispositivoID + "&version=" + Version_app,
                             timeout: TIMEOUT_CONSULTAS,
                             dataType: 'JSON',
                             success: function(data) {
                             
                             
                             $('#link_actualizacion').css('visibility', 'visible');
                             console.log(data.Resultado);
                             if (data.Resultado.length > 0) {
                             $('#link_actualizacion').attr("href", "itms-services://?action=download-manifest&url=" + data.Resultado[0].Url);
                             $('#link_actualizacion').text('Haga clic para instalar la version ' + data.Resultado[0].Version + ".");
                             $('#link_actualizacion').removeClass().addClass("estado_actualizacion_pendiente");
                             } else {
                             $('#link_actualizacion').removeAttr("href");
                             $('#link_actualizacion').text("La aplicacion esta actualizada.");
                             $('#link_actualizacion').removeClass().addClass("estado_actualizacion");
                             }
                             
                             }
                             });
    
    

    
    
    $.when(req_supervisor, req_orden_servicio, req_cco, req_empleados, req_version, req_contratista).then(
                                                                                                                                                      function() {},
                                                                                                                                                      function() {
                                                                                                                                                      funciones.generales.ocultarMostrarBloqueoPantalla("", "desbloquear");
                                                                                                                                                      porcentajeCompletado = 0;
                                                                                                                                                      db_Labores.maestros = 0;
                                                                                                                                                      
                                                                                                                                                      var error_servicios="";
                                                                                                                                                      
                                                                                                                                                      if (req_supervisor.status != "200" && req_supervisor.readyState == 4){
                                                                                                                                                      error_servicios += "Ocurrio un error al obtener los Supervisores " + req_supervisor.responseText + "\n";
                                                                                                                                                      console.log(req_supervisor);
                                                                                                                                                      }
                                                                                                          
                                                                                                                                                      if (req_orden_servicio.status != "200" && req_labores.readyState == 4){
                                                                                                                                                      error_servicios += "Ocurrio un error al obtener las Ordenes de Servicio " + req_labores.responseText+ "\n";
                                                                                                                                                      console.log(req_orden_servicio.readyState);
                                                                                                                                                      }
                                                                                                      
                                                                                                                                                      if (req_cco.status != "200" && req_cco.readyState == 4){
                                                                                                                                                      error_servicios += "Ocurrio un error al obtener los Centros de Costos " + req_cco.responseText+ "\n";
                                                                                                                                                      console.log(req_cco.readyState);
                                                                                                                                                      }
                                                                                                                                         
                                                                                                                                                      
                                                                                                                                                      if (req_empleados.status != "200" && req_empleados.readyState == 4){
                                                                                                                                                      error_servicios += "Ocurrio un error al obtener los Empleados " + req_empleados.responseText+ "\n";
                                                                                                                                                      console.log(req_empleados.readyState);
                                                                                                                                                      }
                                                                                                                                                      
                                                                                                                                                      
                                                                                                                                                      if (req_version.status != "200" && req_version.readyState == 4){
                                                                                                                                                      error_servicios += "Ocurrio un error al obtener la Version " + req_version.responseText+ "\n";
                                                                                                                                                      console.log(req_version.readyState);
                                                                                                                                                      }
                                                                                                                                                      
                                                                                                                                                      if (req_contratista.status != "200" && req_contratista.readyState == 4){
                                                                                                                                                      error_servicios += "Ocurrio un error al obtener los contratistas " + req_contratista.responseText+ "\n";
                                                                                                                                                      console.log(req_contratista.readyState);
                                                                                                                                                      }
                                                                                                                                                      
                                                                                                                                                      alert(error_servicios + " Favor sincronice nuevamente.", "");
                                                                                                                                                      error_servicios ="";
                                                                                                                                                      }
                                                                                                                                                      );
    
}






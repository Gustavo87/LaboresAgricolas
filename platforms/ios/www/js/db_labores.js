/*************Estados locales de los registros************/
//Estado igual a 0 ------> Pendiente a sincronizar
//Estado igual a 1 ------> Sincronizado
//Estado igual a 3 ------> Eliminado
/********************************************************/
var size = 50 * 1024 * 1024;
var db = null;

var db_Labores = {maestros: 0,
crear_db: function () {
    db = window.openDatabase("Database", "1.0", "DB_Labores_2_1", size);
    db.transaction(db_Labores.crear_tabla, db_Labores.error_db, db_Labores.success_db);
},
crear_tabla: function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS Contratista(Codigo TEXT NOT NULL, Nombre TEXT, Grupo TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Supervisor(Codigo TEXT NOT NULL, Nombre TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Precios (Codigo TEXT NOT NULL, Nombre TEXT NOT NULL, Codigo_Actividad TEXT, Ton_Estimadas REAL, Precio_Ref REAL)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Rutas(Codigo TEXT NOT NULL,Nombre TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Centro_Costo(Codigo TEXT NOT NULL, Nombre TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Cuentas(Codigo TEXT NOT NULL, Nombre TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Empleados(Ficha TEXT NOT NULL, Nombre TEXT, Cedula TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Orden_Servicio(Codigo_Plantio TEXT NOT NULL, Plantio TEXT, Codigo_Cuadro TEXT, Cuadro TEXT, Orden_Servicio TEXT,Codigo_Actividad TEXT, Actividad TEXT,Area_Cuadro REAL,UnidadProduccion TEXT,UnidadProduccionN TEXT,UnidadProduccionNCorto TEXT,UnidadPago TEXT)')
    
    
    //Agregamos campos: modulo, asistencia, busqueda
    tx.executeSql('CREATE TABLE IF NOT EXISTS Usuarios_Nueva(Nombre TEXT, Clave TEXT, Estado TEXT, Modulo_ID TEXT,Modulo TEXT, AsistenciaOpcional INTEGER, ScanOpcional INTEGER)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Empresa(Nombre TEXT)');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Sincronizaciones(Fecha TEXT)');
    //tx.executeSql('DROP TABLE IF EXISTS Asistencia');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Asistencia(Id_Asistencia INTEGER PRIMARY KEY AUTOINCREMENT,Fecha_Asistencia TEXT, Presencia_Control TEXT, Presencia_Pegue TEXT, Codigo_Contratista TEXT, Nombre_Contratista TEXT,' +
                  ' Supervisor TEXT, Cuadrilla TEXT, Ruma TEXT, Codigo_Capataz TEXT, Nombre_Capataz TEXT,' +
                  ' Ficha_Empleado TEXT NOT NULL, Cedula_Empleado TEXT, Nombre_Empleado TEXT, Estado TEXT, Usuario TEXT, Fecha TEXT, ID_Transaccion INTEGER,'+
                  ' Control_Escaneado INTEGER, Pegue_Escaneado INTEGER)');
    //tx.executeSql('DROP TABLE IF EXISTS Actividades');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Actividades(Id_Actividad INTEGER PRIMARY KEY AUTOINCREMENT,Fecha_Actividad TEXT, Codigo_Plantio TEXT, Nombre_Plantio TEXT, Cuadro TEXT, Area_labor TEXT,' +
                  ' Codigo_Actividad TEXT NOT NULL, Nombre_Actividad TEXT, Codigo_Contratista TEXT, Nombre_Contratista TEXT, Codigo_Capataz TEXT, Nombre_Capataz TEXT, Cuadrilla TEXT,' +
                  ' Observaciones TEXT, Supervisor TEXT,  Estado TEXT, Usuario TEXT, Fecha TEXT, ID_Transaccion INTEGER, Orden_Servicio TEXT)');
    //tx.executeSql('DROP TABLE IF EXISTS Actividades_Empleados');
    tx.executeSql('CREATE TABLE IF NOT EXISTS Actividades_Empleados(Id_Actividad_Empleado INTEGER PRIMARY KEY AUTOINCREMENT, Id_Actividad INTEGER, Ficha_Empleado TEXT NOT NULL, Cedula_Empleado TEXT, Nombre_Empleado TEXT, ' +
                  ' Ruma TEXT, Codigo_CCO TEXT, Nombre_CCO TEXT, Codigo_CC TEXT, Nombre_CC TEXT, Cantidad_Actividad REAL, Cantidad_Castigo REAL, Cantidad_Pago REAL, Alimento_Recibido TEXT, Supervisor TEXT, ' +
                  ' Estado TEXT, Usuario TEXT, Fecha TEXT, ID_Transaccion INTEGER, ID_Transaccion_Actividad INTEGER, Empleado_Escaneado INTEGER, Codigo_Inversion TEXT,Codigo_Inversion_Actividad TEXT,Unidad_Produccion TEXT,Cantidad_Produccion TEXT, FOREIGN KEY(Id_Actividad) REFERENCES Actividades(Id_Actividad))');
},
alterar_tabla:function(){

    db.transaction(function (tx) {
                   
    tx.executeSql("select sql from sqlite_master where tbl_name = 'Actividades_Empleados'"
      , [], function (tx, resultSet) {
      var sql=resultSet.rows.item(0).sql;
      var noExistenCampos=sql.indexOf('Unidad_Produccion TEXT')<0;
      if(noExistenCampos){
         db.transaction(function (tx) {
         tx.executeSql("Alter table Actividades_Empleados Add Unidad_Produccion TEXT");
         tx.executeSql("Alter table Actividades_Empleados Add Cantidad_Produccion TEXT");
       }, db_Labores.error_db, db_Labores.success_db);
      }
     },function (err) { false });
    
    tx.executeSql("select sql from sqlite_master where tbl_name = 'Actividades'"
    , [], function (tx, resultSet) {
        var sql=resultSet.rows.item(0).sql;
        var noExistenCampos=sql.indexOf('Orden_Servicio TEXT')<0;
        if(noExistenCampos){
        db.transaction(function (tx) {
            tx.executeSql("Alter table Actividades Add Orden_Servicio TEXT");
        }, db_Labores.error_db, db_Labores.success_db);
        }
    },function (err) { false });
                
    }, db_Labores.error_db, db_Labores.success_db);
    
},
obtener_asistencia_todas: function () {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Asistencia"
                                 , [], function (tx, resultSet) {
                                 var arr_asistencia = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_asistencia.push({ item: resultSet.rows.item(i)
                                                     
                                                     });
                                 console.log("Cantidad de asistencia:" + resultSet.rows.item(i).Fecha_Asistencia + " " + resultSet.rows.item(i).Presencia_Control + " " + resultSet.rows.item(i).Presencia_Pegue + " " + resultSet.rows.item(i).Ficha_Empleado);
                                 }
                                 console.log("Cantidad de asistencia:" + arr_asistencia);
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_asistencia_fecha: function (fecha) {
    db.transaction(function (tx) {
                   console.log("Query::::::");
                   console.log("SELECT A.*, AE.Id_Actividad_Empleado FROM Asistencia AS A  LEFT JOIN (SELECT Actividades_Empleados.Id_Actividad_Empleado, Actividades.Fecha_Actividad, Actividades_Empleados.Ficha_Empleado FROM" +
                               " Actividades_Empleados INNER JOIN Actividades on Actividades.Id_Actividad=Actividades_Empleados.Id_Actividad) AS AE on A.Ficha_Empleado= AE.Ficha_Empleado AND AE.Fecha_Actividad='"+fecha+"'" +
                               " WHERE A.Fecha_Asistencia='" + fecha + "' AND A.Estado <> '3'  ORDER By CAST(A.Ficha_Empleado AS INTEGER) ASC");
                   console.log("::::::::::::");
                   tx.executeSql("SELECT A.*, AE.Id_Actividad_Empleado FROM Asistencia AS A  LEFT JOIN (SELECT Actividades_Empleados.Id_Actividad_Empleado, Actividades.Fecha_Actividad, Actividades_Empleados.Ficha_Empleado FROM" +
                                 " Actividades_Empleados INNER JOIN Actividades on Actividades.Id_Actividad=Actividades_Empleados.Id_Actividad and  Actividades_Empleados.Estado<>'3') AS AE on A.Ficha_Empleado= AE.Ficha_Empleado AND AE.Fecha_Actividad='"+fecha+"'" +
                                 " WHERE A.Fecha_Asistencia='" + fecha + "' AND A.Estado <> '3'  ORDER By CAST(A.Ficha_Empleado AS INTEGER) ASC"
                                 , [], function (tx, resultSet) {
                                 var arr_asistencia = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_asistencia.push({ item: resultSet.rows.item(i) });
                                 }
                                 console.log(arr_asistencia);
                                 funciones.asistencia.cargarDetalleAsistencia(arr_asistencia);
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_asistencia_empleado: function (ficha,fecha,opc) {
    
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Asistencia WHERE Ficha_Empleado='" + ficha + "' AND Fecha_Asistencia='"+fecha+"' AND Estado <> '3'  "
                                 , [], function (tx, resultSet) {
                                 
                                 var arr_asistencia = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                  arr_asistencia.push({ item: resultSet.rows.item(i) });
                                 }
                            
                                 if (opc == "validar")
                                 {
                                 funciones.asistencia.validarAsistenciaEmpleado(arr_asistencia);
                                 }
                                 else if(opc=="cargar")
                                 {
                                 funciones.asistencia.cargarAsistencia(arr_asistencia);
                                 }
                                 
                                 
                                 },
                                 function (err) { false });
                   }, function(){alert("No se encontraron datos de asistencia para el empleado.","")}, db_Labores.success_db);
},
obtener_asistenciaID: function (id_asistencia) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Asistencia WHERE Id_Asistencia='" + id_asistencia + "'"
                                 , [], function (tx, resultSet) {
                                 var arr_asistencia = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_asistencia.push({ item: resultSet.rows.item(i) });
                                 }
                                 funciones.asistencia.cargarFormularioAsistencia(arr_asistencia);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
validar_estado_asistencia: function (id_asistencia) {
    var respuesta;
    
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Estado FROM Asistencia WHERE Id_Asistencia='" + id_asistencia + "'"
                                 , [], function (tx, resultSet) {
                                 
                                 if(resultSet.rows.length>0){
                                 funciones.estado_registro =  resultSet.rows.item(0).Estado;

                              
                                 db_Labores.actualizar_estados(3, funciones.asistencia.dataCargada.Id_Asistencia, "Asistencia");
                                 
                                 db_Labores.obtener_asistencia_fecha(fecha_general);
                                 funciones.generales.cancelarEdicionAsistencia();
                                 
                                 
                                 
                                 }
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
borrar_asistencia: function (id_asistencia) {
    db.transaction(function (tx) {
                   tx.executeSql("DELETE FROM Asistencia WHERE Id_Asistencia =" + id_asistencia);
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
obtener_usuario: function () {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Usuarios_Nueva"
                                 , [], function (tx, resultSet) {
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 funciones.usuarios.data.nombre =      resultSet.rows.item(i).Nombre;
                                 funciones.usuarios.data.clave =       resultSet.rows.item(i).Clave;
                                 funciones.usuarios.data.estado =      resultSet.rows.item(i).Estado;
                                 funciones.usuarios.data.Modulo_ID=       resultSet.rows.item(i).Modulo_ID;
                                 funciones.usuarios.data.Modulo=       resultSet.rows.item(i).Modulo;
                                 funciones.usuarios.data.AsistenciaOpcional =  resultSet.rows.item(i).AsistenciaOpcional;
                                 funciones.usuarios.data.ScanOpcional   =  resultSet.rows.item(i).ScanOpcional;
                                 }
                                
                                 
                                 funciones.usuarios.usuarioConectado();
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_empleados: function (data,ul,escaneado) {
    
    var consulta="";
    
    if (escaneado==true){
        consulta = "SELECT * FROM Empleados WHERE Ficha = '" + data + "' OR Cedula = '" + data + "' LIMIT 1";
    }
    else{
        consulta = "SELECT * FROM Empleados WHERE Nombre LIKE '%" + data + "%' OR Ficha LIKE '%" + data + "%' OR Cedula LIKE '%" + data + "%' LIMIT 10";
    }
    
    db.transaction(function (tx) {
                   tx.executeSql(consulta, [], function (tx, resultSet) {
                                 var arr_empleados = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 
                                 console.log(resultSet.rows.item(i).Cedula);
                                 arr_empleados.push({ Ficha: resultSet.rows.item(i).Ficha, Nombre: resultSet.rows.item(i).Nombre, Cedula: resultSet.rows.item(i).Cedula });
                                 }
                                 
                                 if (barcode != "" && resultSet.rows.length==0)
                                 {
                                 alert("No se encontraron empleados", "");
                                 }
                                 else
                                 {
                                 funciones.empleados.cargarEmpleado(arr_empleados, ul);
                                 }
                                 
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_contratista: function (data,ul) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Codigo, Nombre FROM Contratista WHERE Codigo LIKE '%" + data + "%' OR Nombre LIKE '%" + data + "%' LIMIT 10"
                                 , [], function (tx, resultSet) {
                                 var arr_contrata = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_contrata.push({ Codigo: resultSet.rows.item(i).Codigo, Nombre: resultSet.rows.item(i).Nombre });
                                 }
                                 funciones.contratista.cargarContratista(arr_contrata,ul);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},

obtener_centro_costos: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Codigo, Nombre FROM Centro_Costo WHERE Codigo LIKE '%" + data + "%' OR Nombre LIKE '%" + data + "%' LIMIT 10"
                                 , [], function (tx, resultSet) {
                                 var arr_cco = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_cco.push({ Codigo: resultSet.rows.item(i).Codigo, Nombre: resultSet.rows.item(i).Nombre });
                                 }
                                 funciones.CentroCosto.cargarCentroCosto(arr_cco);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_cuenta: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Codigo, Nombre FROM Cuentas WHERE Codigo LIKE '%" + data + "%' OR Nombre LIKE '%" + data + "%' LIMIT 10"
                                 , [], function (tx, resultSet) {
                                 var arr_cuenta = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_cuenta.push({ Codigo: resultSet.rows.item(i).Codigo, Nombre: resultSet.rows.item(i).Nombre });
                                 }
                                 funciones.cuentas.cargarCuentas(arr_cuenta);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_udm_labor: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Lab.* FROM Actividades AS ACT JOIN Actividades_Empleados AS AXE ON AXE.ID_Actividad = ACT.ID_Actividad JOIN Orden_Servicio  As Lab on Lab.Codigo_Actividad=ACT.Codigo_Actividad where AXE.Id_Actividad_Empleado=" + data + "  LIMIT 1"
                                 , [], function (tx, resultSet) {
                                 var arr_labores = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_labores.push({ Codigo: resultSet.rows.item(i).Codigo, Nombre: resultSet.rows.item(i).Nombre, UnidadProduccion: resultSet.rows.item(i).UnidadProduccion,UnidadProduccionN:resultSet.rows.item(i).UnidadProduccionN,UnidadProduccionNCorto : resultSet.rows.item(i).UnidadProduccionNCorto, UnidadPago : resultSet.rows.item(i).UnidadPago});
                                 }
                                 funciones.labores.cargarUDMLabor(arr_labores);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_udm_actividad: function (data,Orden_Servicio) {
    console.log('validando...');
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Orden_Servicio where Codigo_Actividad='" + data + "' LIMIT 1"
                                 , [], function (tx, resultSet) {
                                 var arr_labores = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_labores.push({ Codigo: resultSet.rows.item(i).Codigo_Actividad, Nombre: resultSet.rows.item(i).Actividad, UnidadProduccion: resultSet.rows.item(i).UnidadProduccion,UnidadProduccionN:resultSet.rows.item(i).UnidadProduccionN,UnidadProduccionNCorto : resultSet.rows.item(i).UnidadProduccionNCorto, UnidadPago : resultSet.rows.item(i).UnidadPago});
                                 }
                                 funciones.labores.cargarUDMLabor(arr_labores);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_orden_servicios: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Codigo_Plantio,Plantio,Codigo_Cuadro,Cuadro,Orden_Servicio,Area_Cuadro  FROM Orden_Servicio where Codigo_Plantio like '%"+ data +"%' or  Plantio like '%"+ data +"%' or Orden_Servicio like '%"+ data +"%' GROUP BY Codigo_Plantio,Plantio,Codigo_Cuadro,Cuadro,Orden_Servicio,Area_Cuadro LIMIT 10"
                                 , [], function (tx, resultSet) {
                                 var arr_orden_servicios = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_orden_servicios.push({
                                                          Codigo_Plantio: resultSet.rows.item(i).Codigo_Plantio,
                                                          Plantio: resultSet.rows.item(i).Plantio,
                                                          Codigo_Cuadro: resultSet.rows.item(i).Codigo_Cuadro,
                                                          Cuadro: resultSet.rows.item(i).Cuadro,
                                                          Orden_Servicio: resultSet.rows.item(i).Orden_Servicio,
                                                          Area_Cuadro: resultSet.rows.item(i).Area_Cuadro
                                                          });
                                 }
                                 //funciones.empleados.cargarEmpleado(arr_empleados);
                                 funciones.plantio.cargarOrdenServicios(arr_orden_servicios);
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
obtener_actividades_orden_servicio: function (data) {
    db.transaction(function (tx) {
                   console.log("OS:" + data);
                   tx.executeSql("SELECT Codigo_Actividad,Actividad FROM Orden_Servicio where Orden_Servicio='"+ data +"' order by codigo_actividad"
                                 , [], function (tx, resultSet) {
                                 var arr_orden_servicios = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_orden_servicios.push({
                                                          Codigo_Actividad: resultSet.rows.item(i).Codigo_Actividad,
                                                          Actividad: resultSet.rows.item(i).Actividad
                                                          });
                                 }
                                 //funciones.empleados.cargarEmpleado(arr_empleados);
                                 funciones.labores.cargarActividadesOrdenServicio(arr_orden_servicios);
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
obtener_actividades: function (plantio, cuadro, actividad,fecha,contratista, capataz, cuadrilla, Orden_Servicio) {
    db.transaction(function (tx) {
                   var qDatos ="SELECT * FROM Actividades WHERE Codigo_Plantio='" + plantio + "' AND Cuadro='" + cuadro + "' AND Codigo_Actividad='" + actividad + "' " +
                   " AND Fecha_Actividad='" + fecha + "' AND Codigo_Contratista='" + contratista + "' AND Codigo_Capataz='" + capataz + "' AND Cuadrilla='"+cuadrilla+"' AND Orden_Servicio = '"+ Orden_Servicio +"'";
                   
                   tx.executeSql(qDatos, [], function (tx, resultSet)
                                 {
                                 var arr_actividades = [];
                                 
                                 console.log("Cantidad de Registros " + resultSet.rows.length + " query:" + qDatos);
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 arr_actividades.push({ item: resultSet.rows.item(i) });
                                 }
                                 if (resultSet.rows.length > 0)
                                 {
                                 funciones.actividad.existeActividad = true;
                                 funciones.actividad.idActividad = arr_actividades[0].item.Id_Actividad;
                                 funciones.actividad.idTransaccion = arr_actividades[0].item.ID_Transaccion;
                                 }
                                 else
                                 {
                                 funciones.actividad.existeActividad = false;
                                 }
                                 funciones.actividad.validarActividad();
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
obtener_actividades_todas: function () {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Actividades_Empleados "
                                 , [], function (tx, resultSet)
                                 {
                                 var arr_actividades = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 console.log(resultSet.rows.item(i).Ficha_Empleado + " - " + resultSet.rows.item(i).Estado)
                                 }
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
borrar_actividad: function (id_actividad) {
    db.transaction(function (tx) {
                   tx.executeSql("DELETE FROM Actividades_Empleados WHERE Id_Actividad_Empleado =" + id_actividad);
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
obtener_asistencia_todas: function () {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Asistencia "
                                 , [], function (tx, resultSet)
                                 {
                                 var arr_actividades = [];
                                 for (var i = 0; i < resultSet.rows.length; i++) {
                                 console.log(resultSet.rows.item(i).Ficha_Empleado + " - " + resultSet.rows.item(i).Estado)
                                 }
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},

    
obtener_actividadesEmpleado: function (fichaEmpleado, fecha) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Actividades_Empleados as AE inner join Actividades as A on AE.Id_Actividad=A.Id_Actividad  "+
                                 " WHERE AE.Ficha_Empleado='" + fichaEmpleado + "' AND A.Fecha_Actividad='" + fecha + "' AND AE.Estado<>3"
                                 , [], function (tx, resultSet) {
                                 if(resultSet.rows.length>0)
                                 {
                                 confirm("El empleado seleccionado ya realizó una labor el dia de hoy, desea asignarle otra?", "", function (btnIndex) {
                                         if (btnIndex != 1)
                                         {
                                         $("#inp_empleadoDE").val("");
                                         $("#inp_rumaDE").val("");
                                         funciones.empleados.dataEmpleadoActividad.nombre = "";
                                         funciones.empleados.dataEmpleadoActividad.ficha = "";
                                         funciones.empleados.dataEmpleadoActividad.cedula = "";
                                         }
                                         });
                                 }
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
validar_estado_actividad: function (id_actividad) {
    var respuesta;
    
    db.transaction(function (tx) {
                   tx.executeSql("SELECT Estado FROM Actividades_Empleados WHERE Id_Actividad_Empleado='" + id_actividad + "'"
                                 , [], function (tx, resultSet) {
                                 console.log('tiene' + resultSet.rows.length);
                                 if(resultSet.rows.length>0){
                                 funciones.estado_registro =  resultSet.rows.item(0).Estado;
                                 
                                 db_Labores.actualizar_estados(3, funciones.actividadEmpleado.data[0].item.Id_Actividad_Empleado, "Actividades_Empleados");
                                 
                                 contenedorEmp = "";
                                 $("#span_retroceder").addClass("hide");
                                 db_Labores.obtener_datos_reporte_apuntes(fecha_general);
                                 funciones.generales.limpiarFormularioActividadesEmpleado();
                                 funciones.generales.transicionPantalla("form_datos_empleados", "form_reportes");
                                 funciones.generales.seleccionarOpcionMenu("nav_reportes");
                                 
                                 }
                                 
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
validar_actividadesEmpleado: function (fichaEmpleado, fecha) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Actividades_Empleados as AE inner join Actividades as A on AE.Id_Actividad=A.Id_Actividad  " +
                                 " WHERE AE.Ficha_Empleado='" + fichaEmpleado + "' AND A.Fecha_Actividad='" + fecha + "' AND AE.Estado<>3"
                                 , [], function (tx, resultSet) {
                                 if (resultSet.rows.length > 0) {
                                 funciones.asistencia.tieneActividad = true;
                                 alert("El empleado seleccionado ya posee un actividad asignada para el dia de hoy, no puede ser modificado", "");
                                 funciones.generales.cancelarEdicionAsistencia();
                                 }
                                 else {
                                 funciones.asistencia.tieneActividad = false;
                                 }
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_actividadesEmpleadoID: function (id_actividad_empleado) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT * FROM Actividades_Empleados " +
                                 " WHERE Id_Actividad_Empleado='" + id_actividad_empleado + "' "
                                 , [], function (tx, resultSet) {
                                 var arr_actEmp = [];
                                 for (var i = 0; i < resultSet.rows.length; i++)
                                 {
                                 arr_actEmp.push({ item: resultSet.rows.item(i) });
                                 }
                                 funciones.actividadEmpleado.cargarDatosActividadEmpleado(arr_actEmp);
                                 },
                                 function (err) { false });
                   }, db_Labores.error_db, db_Labores.success_db);
},
obtener_apuntes_sincronizar:function(fecha_seleccionada)
    {
        db.transaction(function (tx) {
                       tx.executeSql("SELECT * FROM Asistencia WHERE Estado=0 or Estado=3"
                                     , [], function (tx, resultSet) {
                                     var arr_asistencia = [];
                                     for (var i = 0; i < resultSet.rows.length; i++) {
                                     arr_asistencia.push({ item: resultSet.rows.item(i) });
                                     }
                                     console.log("Cantidad de asistencia:" + arr_asistencia.length);
                                     funciones.asistencia.data = arr_asistencia;
                                     },
                                     function (err) { false });
                       tx.executeSql("SELECT ACT.Id_Actividad,ACT.Fecha_Actividad,ACT.Codigo_Plantio,ACT.Nombre_Plantio,ACT.Cuadro,ACT.Area_labor,ACT.Codigo_Actividad,ACT.Nombre_Actividad,ACT.Codigo_Contratista,ACT.Nombre_Contratista ,ACT.Codigo_Capataz,ACT.Nombre_Capataz,ACT.Cuadrilla,ACT.Observaciones,ACT.Supervisor,ACT.Estado,ACT.Usuario,ACT.Fecha,ACT.ID_Transaccion,ACT.Orden_Servicio FROM Actividades AS ACT JOIN Actividades_Empleados AS AXE ON AXE.Id_Actividad=ACT.Id_Actividad where AXE.estado<>1 GROUP BY ACT.Id_Actividad,ACT.Fecha_Actividad,ACT.Codigo_Plantio,ACT.Nombre_Plantio,ACT.Cuadro,ACT.Area_labor,ACT.Codigo_Actividad,ACT.Nombre_Actividad,ACT.Codigo_Contratista,ACT.Nombre_Contratista ,ACT.Codigo_Capataz,ACT.Nombre_Capataz,ACT.Cuadrilla,ACT.Observaciones,ACT.Supervisor,ACT.Estado,ACT.Usuario,ACT.Fecha,ACT.ID_Transaccion,ACT.Orden_Servicio"
                                     , [], function (tx, resultSet) {
                                     var arr_actividades = [];
                                     for (var i = 0; i < resultSet.rows.length; i++) {
                                     arr_actividades.push({ item: resultSet.rows.item(i) });
                                     }
                                     console.log("Cantidad de actividad:" + arr_actividades.length);
                                     funciones.actividad.data = arr_actividades;
                                     },
                                     function (err) { false });
                       tx.executeSql("SELECT AE.*, A.Codigo_Actividad,A.ID_Transaccion As Id_Actividad_Plantio FROM Actividades_Empleados as AE inner join Actividades as A on AE.Id_Actividad=A.Id_Actividad WHERE AE.Estado=0 or AE.Estado=3"
                                     , [], function (tx, resultSet) {
                                     var arr_actividades_empleados = [];
                                     for (var i = 0; i < resultSet.rows.length; i++) {
                                     arr_actividades_empleados.push({ item: resultSet.rows.item(i) });
                                     }
                                     console.log("Cantidad de Actividades_Empleados:" + arr_actividades_empleados.length);
                                     console.log(arr_actividades_empleados);
                                     funciones.actividadEmpleado.data= arr_actividades_empleados;
                                     },
                                     function (err) { false });
                       }, db_Labores.error_db, function () {
                       funciones.generales.sincronizar_apuntes(funciones.asistencia.data, funciones.actividad.data, funciones.actividadEmpleado.data);
                       //Limpia Objetos Globales...
                       funciones.asistencia.data={};
                       funciones.actividad.data={};
                       funciones.actividadEmpleado.data={};
                       });
    },
obtener_datos_reporte_labores: function (fecha) {
    db.transaction(function (tx) {
                   tx.executeSql("SELECT A.Codigo_Contratista, A.Codigo_Capataz, A.Cuadrilla, AE.Ruma, COUNT(DISTINCT AE.Ficha_Empleado) AS Empleados, SUM(AE.Cantidad_Actividad) AS Actividades," +
                                 " SUM(AE.Cantidad_Actividad)/COUNT(DISTINCT AE.Ficha_Empleado) AS Promedio" +
                                 " FROM Actividades_Empleados as AE inner join Actividades as A on AE.Id_Actividad=A.Id_Actividad  " +
                                 " WHERE  A.Fecha_Actividad='" + fecha + "' AND AE.Estado<>3 GROUP BY A.Codigo_Contratista,A.Codigo_Capataz,A.Cuadrilla,AE.Ruma "+
                                 " ORDER BY CAST(AE.Ruma AS INTEGER) ASC"
                                 , [], function (tx, resultSet) {
                                 var arr_detalle_ruma = [];
                                 for (var j = 0; j < resultSet.rows.length; j++) {
                                 arr_detalle_ruma.push({ item: resultSet.rows.item(j)});
                                 }
                                 funciones.generales.cargarReporteRuma(arr_detalle_ruma);
                                 }, function (tx,err) {
                                 console.log("error: " + err)
                                 });
                   
                   }, db_Labores.error_db, function () {
                   
                   });
},
obtener_datos_reporte_apuntes: function (fecha) {
    db.transaction(function (tx) {
                   
                   tx.executeSql("SELECT * " +
                                 " FROM Actividades_Empleados as AE inner join Actividades as A on AE.Id_Actividad=A.Id_Actividad  " +
                                 " WHERE  A.Fecha_Actividad='" + fecha + "' AND AE.Estado <> 3" +
                                 " ORDER BY  A.Codigo_Actividad ASC"
                                 , [], function (tx, resultSet) {
                                 var arr_apunte= [];
                                 for (var j = 0; j < resultSet.rows.length; j++) {
                                 arr_apunte.push({ item: resultSet.rows.item(j) });
                                 }
                                 funciones.generales.cargarReporteApunte(arr_apunte);
                                 }, function (tx, err) {
                                 console.log("error: " + err)
                                 });
                   
                   }, db_Labores.error_db, function () {
                   
                   });
},
tiene_almuerzos: function (ficha,fecha,id_actividad_empleado) {
    db.transaction(function (tx) {
                   
                   tx.executeSql("SELECT ACT.Codigo_Actividad As Codigo_Actividad,1 As Almuerzos FROM Actividades_Empleados AS AXE JOIN Actividades AS ACT ON ACT.ID_Actividad=AXE.ID_Actividad WHERE ficha_empleado='"+ ficha +"' and Alimento_Recibido='Si' and ACT.fecha_actividad='"+ fecha +"' and AXE.Id_Actividad_Empleado <> '"+ id_actividad_empleado +"' AND AXE.Estado <> '3' "
                                 , [], function (tx, resultSet) {
                      
                                 if(resultSet.rows.length>0){
                                 funciones.generales.validarAlmuerzo(resultSet.rows.item(0).Almuerzos,resultSet.rows.item(0).Codigo_Actividad);
                                 }
                                 
                                 
                                 }, function (tx, err) {
                                 console.log("error: " + err)
                                 });
                   
                   }, db_Labores.error_db, function () {
                   
                   });
},
    
insertar_asistencia: function (data) {
    
    
    if(data.Presencia_Pegue == 1 && data.Presencia_Control != 1){
        
        
        db.transaction(function (tx) {
                       
                       tx.executeSql("SELECT Presencia_Control FROM Asistencia where Fecha_Asistencia='" + data.Fecha_Asistencia + "' and Ficha_Empleado='" + data.Codigo_Empleado + "'" , [], function (tx, resultSet) {
                                     
                                     if( resultSet.rows.length == 0){
                                     
                                     confirm("Este empleado no tiene asistencia de control, desea continuar registrando al asistencia de pegue?", "", function (btnIndex) {
                                             if(btnIndex==1)
                                             {
                                             
                                             db.transaction(function (tx) {
                                                            tx.executeSql("INSERT INTO Asistencia(Fecha_Asistencia,Presencia_Control, Presencia_Pegue, Codigo_Contratista, Nombre_Contratista," +
                                                                          " Supervisor, Cuadrilla, Ruma, Codigo_Capataz, Nombre_Capataz, Ficha_Empleado, Cedula_Empleado, Nombre_Empleado, Estado, Usuario,Fecha,ID_Transaccion,Control_Escaneado,Pegue_Escaneado) VALUES " +
                                                                          " ('" + data.Fecha_Asistencia + "', '" + data.Presencia_Control + "', '" + data.Presencia_Pegue + "','" + data.Codigo_Contratista + "','" + data.Nombre_Contratista + "'," +
                                                                          " '" + data.Supervisor + "', '"+data.Cuadrilla+"','"+data.Ruma+"','"+data.Codigo_Capataz+"', '"+data.Nombre_Capataz+"','" + data.Codigo_Empleado + "'," +
                                                                          " '" + data.Cedula_Empleado + "','" + data.Nombre_Empleado + "','" + data.Estado + "','" + data.Usuario_Transaccion + "','" + data.Fecha_Transaccion + "','" + data.Id_Transaccion + "', '"+data.Control_Escaneado+"', '"+data.Pegue_Escaneado+"')");
                                                            }, db_Labores.error_db, function () {
                                                            funciones.generales.resetSelectTipoAsistencia();
                                                            //   alert("Datos guardados correctamente","");
                                                            });
                                             
                                             }
                                             
                                             });
                                     
                                     }
                                     
                                     
                                     
                                     }, function (tx, err) {
                                     console.log("error: " + err)
                                     });
                       
                       }, db_Labores.error_db, db_Labores.success_db);
        
        
    }
    
    else{
        
        db.transaction(function (tx) {
                       tx.executeSql("INSERT INTO Asistencia(Fecha_Asistencia,Presencia_Control, Presencia_Pegue, Codigo_Contratista, Nombre_Contratista," +
                                     " Supervisor, Cuadrilla, Ruma, Codigo_Capataz, Nombre_Capataz, Ficha_Empleado, Cedula_Empleado, Nombre_Empleado, Estado, Usuario,Fecha,ID_Transaccion, Control_Escaneado,Pegue_Escaneado) VALUES " +
                                     " ('" + data.Fecha_Asistencia + "', '" + data.Presencia_Control + "', '" + data.Presencia_Pegue + "','" + data.Codigo_Contratista + "','" + data.Nombre_Contratista + "'," +
                                     " '" + data.Supervisor + "', '"+data.Cuadrilla+"','"+data.Ruma+"','"+data.Codigo_Capataz+"', '"+data.Nombre_Capataz+"','" + data.Codigo_Empleado + "'," +
                                     " '" + data.Cedula_Empleado + "','" + data.Nombre_Empleado + "','" + data.Estado + "','" + data.Usuario_Transaccion + "','" + data.Fecha_Transaccion + "','" + data.Id_Transaccion + "', '"+data.Control_Escaneado+"', '"+data.Pegue_Escaneado+"')");
                       }, db_Labores.error_db, function () {
                       funciones.generales.resetSelectTipoAsistencia();
                       alert("Datos guardados correctamente","");
                       });
        
    }
    
    
    
    
    
    
    
    
},
insertar_actividad: function (dataActividad,dataEmpleadoActividad,CallbackExito,CallbackFallo) {
    db.transaction(function (tx) {
                   tx.executeSql("INSERT INTO Actividades(Fecha_Actividad,Codigo_Plantio, Nombre_Plantio, Cuadro, Area_Labor, Codigo_Actividad, Nombre_Actividad," +
                                 "  Codigo_Contratista, Nombre_Contratista, Codigo_Capataz, Nombre_Capataz, Cuadrilla, Observaciones, Supervisor, Estado, Usuario,Fecha,ID_Transaccion,Orden_Servicio) VALUES " +
                                 " ('" + dataActividad.Fecha_Actividad + "', '" + dataActividad.Codigo_Plantio + "', '" + dataActividad.Nombre_Plantio + "','" + dataActividad.Cuadro + "','" + dataActividad.Area_Labor + "'," +
                                 " '" + dataActividad.Codigo_Actividad + "', '" + dataActividad.Nombre_Actividad + "','" + dataActividad.Codigo_Contratista + "','" + dataActividad.Nombre_Contratista + "', '" + dataActividad.Codigo_Capataz + "','" + dataActividad.Nombre_Capataz + "'," +
                                 " '" + dataActividad.Cuadrilla + "','" + dataActividad.Observaciones + "','" + dataActividad.Supervisor + "','" + dataActividad.Estado + "','" + dataActividad.Usuario + "','" + dataActividad.Fecha + "','" + dataActividad.ID_Transaccion + "','" + dataActividad.Orden_Servicio + "')", [],
                                 function (transaction, resultSet) {
                                 funciones.actividad.existeActividad = true;
                                 funciones.actividad.idActividad = resultSet.insertId;
                                 db_Labores.insertar_actividad_empleado(dataEmpleadoActividad, resultSet.insertId,0,CallbackExito,function(){});
                                 }, db_Labores.error_db);
                   }, function(){CallbackFallo(); alert("Ocurrio un error y el registro no se guardo!");}, function(){});
},
insertar_actividad_empleado: function (data,Id_actividad, Id_transaccion_actividad,CallbackExito,CallbackFallo) {
    db.transaction(function (tx) {
                   tx.executeSql("INSERT INTO Actividades_Empleados(Id_Actividad, Ficha_Empleado, Cedula_Empleado, Nombre_Empleado, " +
                                 " Ruma, Codigo_CCO, Nombre_CCO, Codigo_CC, Nombre_CC, Cantidad_Actividad, Cantidad_Castigo, Cantidad_Pago, Alimento_Recibido, Supervisor, " +
                                 " Estado, Usuario, Fecha, ID_Transaccion,ID_Transaccion_Actividad, Empleado_Escaneado, Codigo_Inversion, Codigo_Inversion_Actividad ,Unidad_Produccion,Cantidad_Produccion) VALUES " +
                                 " ('" + Id_actividad + "', '" + data.Ficha_Empleado + "', '" + data.Cedula_Empleado + "','" + data.Nombre_Empleado + "','" + data.Ruma + "'," +
                                 " '" + data.Codigo_CCO + "', '" + data.Nombre_CCO + "','" + data.Codigo_CC + "','" + data.Nombre_CC + "', '" + data.Cantidad_Actividad + "','" + data.Cantidad_Castigo + "'," +
                                 " '" + data.Cantidad_Pago + "','" + data.Alimento_Recibido + "','" + data.Supervisor + "','" + data.Estado + "','" + data.Usuario + "','" + data.Fecha + "','" + data.ID_Transaccion + "','"+Id_transaccion_actividad+"', '"+data.Empleado_Escaneado+"','','', '"+ data.Unidad_Produccion + "' , '"+ data.Cantidad_Produccion + "')");
                   }, function(){CallbackFallo(); alert("Ocurrio un error y el registro no se guardo");}, CallbackExito);
},
insertar_sincronizacion: function () {
    db.transaction(function (tx) {
                   tx.executeSql("INSERT INTO Sincronizaciones(Fecha) VALUES ('" + (new Date().getMonth() + 1) + '-' + new Date().getDate() + '-' + new Date().getFullYear() + ' ' + new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + "')");
                   }, db_Labores.error_db, db_Labores.success_db);
},
insertar_contratista: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Contratista(Codigo,Nombre,Grupo) VALUES ('" + data[i].Codigo + "','" + data[i].Nombre + "','" + data[i].Grupo + "')");
                   
                   }
                   
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},
insertar_supervisor: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Supervisor(Codigo,Nombre) VALUES ('" + data[i].Codigo + "','" + data[i].Nombre + "')");
                   
                   }
                   
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},
insertar_plantios: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Plantios(Codigo,Nombre,Cuadro, Area_Cuadro, Tipo, Ton_Estimadas) VALUES " +
                                 " ('" + data[i].Codigo + "','" + data[i].Nombre + "','" + data[i].Cuadro + "','" + data[i].Area_Cuadro + "','" + data[i].Tipo + "','" + data[i].Ton_Estimadas + "')");
                   
                   }
                   
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},
insertar_orden_servicio: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Orden_Servicio(Codigo_Plantio,Plantio,Codigo_Cuadro,Cuadro, Orden_Servicio, Codigo_Actividad,Actividad,Area_Cuadro,UnidadProduccion,UnidadProduccionN,UnidadProduccionNCorto,UnidadPago) VALUES " +
                                 " ('" + data[i].Codigo_Plantio + "','" + data[i].Plantio + "','" + data[i].Codigo_Cuadro + "','" + data[i].Cuadro + "','" + data[i].Orden_Servicio + "','" + data[i].Codigo_Actividad + "','" + data[i].Actividad + "','" + data[i].Area_Cuadro + "','" + data[i].UnidadProduccion + "','" + data[i].UnidadProduccionN + "','" + data[i].UnidadProduccionNCorto + "','" + data[i].UnidadPago + "')");
                   
                   }
                   
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},

insertar_labores: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Labores(Codigo,Nombre,UnidadProduccion,UnidadProduccionN,UnidadProduccionNCorto,UnidadPago) VALUES ('" + data[i].Codigo + "','" + data[i].Nombre + "','" + data[i].UnidadProduccion +  "','" + data[i].UnidadProduccionN + "','" + data[i].UnidadProduccionNCorto + "', '"  + data[i].UnidadPago + "')");
                   
                   }
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},

insertar_centro_costo: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Centro_Costo(Codigo,Nombre) VALUES ('" + data[i].Codigo + "','" + data[i].Nombre + "')");
                   }
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},
insertar_cuenta: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Cuentas(Codigo,Nombre) VALUES ('" + data[i].Codigo + "','" + data[i].Nombre + "')");
                   }
                   }, db_Labores.error_maestros, db_Labores.success_maestros);
},
insertar_empleados: function (data) {
    db.transaction(function (tx) {
                   for (var i = 0; i < data.length; i++) {
                   tx.executeSql("INSERT INTO Empleados(Ficha,Nombre,Cedula) VALUES ('" + data[i].Ficha + "','" + data[i].Nombre + "','"  + data[i].Cedula + "')");
                   }
                   }, db_Labores.error_db, db_Labores.success_db);
},
insertar_empresa: function (empresa) {
    db.transaction(function (tx) {
                   tx.executeSql("INSERT INTO Empresa(Nombre) VALUES ('" + empresa + "')");
                   }, db_Labores.error_db, db_Labores.success_db);
},
insertar_usuario: function (nombre, clave, estado,Modulo_ID,Modulo,AsistenciaOpcional,ScanOpcional) {
    db.transaction(function (tx) {

                   tx.executeSql("INSERT INTO Usuarios_Nueva(Nombre, Clave, Estado, Modulo_ID, Modulo, AsistenciaOpcional, ScanOpcional) VALUES ('" + nombre + "','" + clave + "','" + estado + "','" + Modulo_ID + "','" + Modulo + "'," + AsistenciaOpcional + "," +  ScanOpcional + ")");
                   
                   }, db_Labores.error_db, db_Labores.success_db);
},

actualizar_usuario: function (nombre, estado) {
    db.transaction(function (tx) {
                   tx.executeSql("UPDATE Usuarios_Nueva SET estado='"+estado+"' WHERE Nombre='"+nombre+"'");
                   }, db_Labores.error_db, db_Labores.success_db);
},
actualizar_PermisosUsuario: function (nombre, Modulo_ID,Modulo,AsistenciaOpcional,ScanOpcional) {
    db.transaction(function (tx) {
                   tx.executeSql("UPDATE Usuarios_Nueva SET Modulo_ID='"+Modulo_ID+"',Modulo='"+Modulo+"',AsistenciaOpcional='"+AsistenciaOpcional+"',ScanOpcional='"+ScanOpcional+"' WHERE Nombre='"+nombre+"'");
                   }, db_Labores.error_db, db_Labores.success_db);
},
actualizar_presencia_asistencia: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("UPDATE Asistencia SET  Presencia_Control='" + data.Presencia_Control + "', Presencia_Pegue='" + data.Presencia_Pegue +
                                 "'  WHERE Id_Asistencia='" + data.Id_Asistencia + "'", [], function (transaction, resultSet) {
                                 db_Labores.actualizar_estados(0, data.Id_Asistencia, "Asistencia");
                                 });
                   }, db_Labores.error_db, db_Labores.success_db);
},
actualizar_asistencia: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("UPDATE Asistencia SET  Presencia_Control='" + data.Presencia_Control + "', Presencia_Pegue='" + data.Presencia_Pegue + "', "+
                                 " Codigo_Contratista ='"+data.Codigo_Contratista+"', Nombre_Contratista ='"+data.Nombre_Contratista+"'," +
                                 " Cuadrilla='"+data.Cuadrilla+"', Ruma ='"+data.Ruma+"', Codigo_Capataz ='"+data.Codigo_Capataz+"', Nombre_Capataz ='"+data.Nombre_Capataz+"'," +
                                 " Ficha_Empleado ='"+data.Ficha_Empleado+"', Cedula_Empleado ='"+data.Cedula_Empleado+"', Nombre_Empleado = '"+data.Nombre_Empleado+"', Estado='"+data.Estado+"', "+
                                 " Control_Escaneado='"+data.Control_Escaneado+"', Pegue_Escaneado='"+data.Pegue_Escaneado+"' WHERE Id_Asistencia='" + data.Id_Asistencia + "'", [], function (transaction, resultSet) {
                                 db_Labores.actualizar_estados(0, data.Id_Asistencia, "Asistencia");
                                 });
                   }, db_Labores.error_db, function(){ alert("Datos guardados exitosamente.")});
},
actualizar_asistencia_temp: function (data) {
    db.transaction(function (tx) {
                   tx.executeSql("UPDATE Asistencia SET  Presencia_Control='1', Presencia_Pegue='1' " +
                                 " WHERE Id_Asistencia='47' ", [], function (transaction, resultSet) {
                                 
                                 });
                   }, db_Labores.error_db, db_Labores.success_db);
},
actualizar_id_transaccion: function (idLocal, idTransaccion, tabla) {
    db.transaction(function (tx) {
                   var campo = "";
                   if (tabla == "Asistencia") {
                   campo = "Id_Asistencia";
                   }
                   else if (tabla=="Actividades") {
                   campo = "Id_Actividad";
                   }
                   else if (tabla=="Actividades_Empleados")
                   {
                   campo = "Id_Actividad_Empleado";
                   }
                   tx.executeSql("UPDATE " + tabla + " SET ID_Transaccion='" + idTransaccion + "' WHERE " + campo + "= '" + idLocal + "'");
                   }, db_Labores.error_db, db_Labores.success_db);
},
    
actualizar_id_transaccion_actividad: function (ID_Transaccion_Actividad, Id_Actividad_Empleado) {
    db.transaction(function (tx) {
                   
                   
                   tx.executeSql("UPDATE Actividades SET ID_Transaccion='" + ID_Transaccion_Actividad + "' WHERE Id_Actividad= '" + Id_Actividad_Empleado + "'");
                   }, db_Labores.error_db, db_Labores.success_db);
},
actualizar_estados: function (estado, id, tabla) {
    db.transaction(function (tx) {
                   var campo = "";
                   if (tabla == "Asistencia") {
                   campo = "Id_Asistencia";
                   }
                   else if (tabla == "Actividades") {
                   campo = "Id_Actividad";
                   }
                   else if (tabla == "Actividades_Empleados") {
                   campo = "Id_Actividad_Empleado";
                   }
                   tx.executeSql("UPDATE " + tabla + " SET estado='" + estado + "' WHERE " + campo + "= '" + id + "'");
                   }, db_Labores.error_db, db_Labores.success_db);
},
actualizar_actividad_empleado: function (data,Exito,Fallo) {
    db.transaction(function (tx) {
                   tx.executeSql("UPDATE Actividades_Empleados SET  Ficha_Empleado ='"+data.Ficha_Empleado+"', Cedula_Empleado ='"+data.Cedula_Empleado+"', Nombre_Empleado ='"+data.Nombre_Empleado+"', " +
                                 " Ruma ='" + data.Ruma + "', Codigo_CCO ='" + data.Codigo_CCO + "', Nombre_CCO= '" + data.Nombre_CCO + "', Codigo_CC ='" + data.Codigo_CC + "', Nombre_CC ='" + data.Nombre_CC + "', " +
                                 " Cantidad_Actividad ='" + data.Cantidad_Actividad + "', Cantidad_Castigo ='" + data.Cantidad_Castigo + "', Cantidad_Pago ='" + data.Cantidad_Pago + "', Alimento_Recibido ='" + data.Alimento_Recibido + "'," +
                                 " Estado='"+data.Estado+"', Empleado_Escaneado='"+data.Empleado_Escaneado+"', Unidad_Produccion='"+ data.Unidad_Produccion +"', Cantidad_Produccion='"+ data.Cantidad_Produccion + "' WHERE Id_Actividad_Empleado='" + data.Id_Actividad_Empleado + "'", [], function (transaction, resultSet) {
                                 });
                   }, function(){ Fallo(); alert("Ocurrio un error y el registro no se guardo"); }, Exito);
},
borrar_datos_pendientes: function (tabla) {
    db.transaction(function (tx) {
                   tx.executeSql("DELETE FROM "+tabla+" WHERE Estado =3");
                   }, db_Labores.error_db, db_Labores.success_db);
},
limpiar_tabla: function (tb_nombre) {
    db.transaction(function (tx) {
                   tx.executeSql("DELETE FROM " + tb_nombre + " WHERE 1");
                   }, db_Labores.error_db, db_Labores.success_db);
},
success_db: function () {
    console.log("Termino");
},
success_maestros: function () {
    db_Labores.maestros += 1;
    console.log("Maestros:" + db_Labores.maestros);
    funciones.generales.notificarFinSincronizacion(db_Labores.maestros);
},
error_maestros: function (tx, error) {
    db_Labores.maestros += 1;
    console.log("Maestros Error:" + db_Labores.maestros);
    alert("Ha ocurrido un error al guardar uno de los maestros", "");
    funciones.generales.notificarFinSincronizacion(db_Labores.maestros);
},
error_db: function (tx, error) {
    alert("Ocurrió un error al realizar la operación solicitada" + tx,"");
    console.log("Error processing SQL: " + tx);
    
}
}

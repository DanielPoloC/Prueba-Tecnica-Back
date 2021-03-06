require("dotenv").config();

const express = require("express");
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json())

const { Pool } = require('pg')
const pool = new Pool({ ssl: { rejectUnauthorized: false } })

app.get("/", (req, res) => {
  res.send("Developer By: Daniel Eduardo Polo Campo")
});

app.get("/v1/empleados/obtener", async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        primer_nombre,
        otros_nombres,
        primer_apellido,
        segundo_apellido,
        pais_empleo,
        tipo_identificacion,
        numero_identificacion,
        correo_electronico,
        TO_CHAR(fecha_ingreso, 'DD/MM/YYYY') fecha_ingreso,
        nombre_area,
        estado,
        TO_CHAR(fecha_registro, 'DD/MM/YYYY hh:mm:ss') fecha_registro,
        TO_CHAR(fecha_edicion, 'DD/MM/YYYY  hh:mm:ss') fecha_edicion
      FROM empleado 
      WHERE estado = 'Activo'
    `
    const result = await pool.query(query)
    res.send({ success: true, result: result.rows })
  } catch (error) {
    console.error(error);
    res.send({ success: false, result: error.message })
  }
});

app.post("/v1/empleados/crear", async (req, res) => {
  try {
    const query = `
      insert into empleado
      (
        primer_apellido,
        segundo_apellido,
        primer_nombre,
        otros_nombres,
        pais_empleo,
        tipo_identificacion,
        numero_identificacion,
        correo_electronico,
        fecha_ingreso,
        nombre_area,
        estado
      )
      values 
      (
        '${req.body.primer_apellido}',
        '${req.body.segundo_apellido}',
        '${req.body.primer_nombre}',
        '${req.body.otros_nombres}',
        '${req.body.pais_empleo}',
        '${req.body.tipo_identificacion}',
        '${req.body.numero_identificacion}',
        '${req.body.correo_electronico}',
        TO_DATE(${req.body.fecha_ingreso ? '\'' + req.body.fecha_ingreso + '\'' : null}, 'DD/MM/YYYY'),
        '${req.body.nombre_area}',
        '${req.body.estado}'
      )
    `
    await pool.query(query)
    res.send({ success: true, result: "Creado con ??xito" })
  } catch (error) {
    console.error(error);
    res.send({ success: false, result: error.message })
  }
});

app.put("/v1/empleados/modificar", async (req, res) => {
  try {
    const query = `
      update
        empleado
      set
        primer_apellido = '${req.body.primer_apellido}',
        segundo_apellido = '${req.body.segundo_apellido}',
        primer_nombre = '${req.body.primer_nombre}',
        otros_nombres = '${req.body.otros_nombres}',
        pais_empleo = '${req.body.pais_empleo}',
        tipo_identificacion = '${req.body.tipo_identificacion}',
        numero_identificacion = '${req.body.numero_identificacion}',
        correo_electronico = '${req.body.correo_electronico}',
        fecha_ingreso =  TO_DATE('${req.body.fecha_ingreso}', 'DD/MM/YYYY'),
        nombre_area = '${req.body.nombre_area}',
        estado= '${req.body.estado}'
      where
        numero_identificacion = '${req.body.documento}'
    `
    const result = await pool.query(query)
    res.send({ success: true, result: result.rowCount ? "Modificado con ??xito" : "No se encontr?? empleado" })
  } catch (error) {
    console.error(error);
    res.send({ success: false, result: error.message })
  }
});

app.delete("/v1/empleados/:identificacion/eliminar", async (req, res) => {
  try {
    const query = `
        update empleado 
        set estado = 'Inactivo' 
        where numero_identificacion = '${req.params.identificacion}'
      `
    const result = await pool.query(query)
    res.send({ success: true, result: result.rowCount ? "Eliminado con ??xito" : "No se encontr?? empleado" })
  } catch (error) {
    console.error(error);
    res.send({ success: false, result: error.message })
  }
});

app.get("/v1/empleados/:nombre/:apellido/correo", async (req, res) => {
  try {
    const nombre = req.params.nombre
    const apellido = req.params.apellido
    const query = `
      SELECT count(correo_electronico) secuencia
      from empleado e 
      where primer_nombre = '${nombre}' 
        and primer_apellido = '${apellido}'
    `
    const result = await pool.query(query)
    const secuencia = result.rows[0].secuencia 

    res.send({ success: true, result: `${nombre}.${apellido}${secuencia > 0 ? '.' + secuencia : ''}@cidenet.com.co`})
  } catch (error) {
    console.error(error);
    res.send({ success: false, result: error.message })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.info("PORT", process.env.PORT || 3000);
});

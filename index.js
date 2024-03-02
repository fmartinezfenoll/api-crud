"use strict";
// importaciones
const config = require("./config");
const logger = require("morgan");
const mongojs = require("mongojs");
const cors = require("cors");
const helmet = require("helmet");
var express = require("express");
var fs = require("fs");
var https = require("https");
var app = express();


// Declaraciones
const port = config.PORT;
const urlDB = config.DB;
const accessToken = config.TOKEN;
const db = mongojs(urlDB); // Enlazamos con la DB
const id = mongojs.ObjectID; // Función para convertir un id textual en un objectID


// middlewares
app.use(helmet());
app.use(logger("dev")); // probar con: tiny, short, dev, common, combined
app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json
app.use(cors()); // activamos CORS
app.use(allowCrossTokenOrigin); // configuramos origen permitido para CORS
app.use(allowCrossTokenMethods); // configuramos métodos permitidos para CORS
app.use(allowCrossTokenHeaders); // configuramos cabeceras permitidas para CORS


// Declaraciones para CORS
var allowCrossTokenOrigin = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permiso a cualquier URL. Mejor acotar
  return next();
};
var allowCrossTokenMethods = (req, res, next) => {
  res.header("Access-Control-Allow-Methods", "*"); // Mejor acotar (GET,PUT,POST,DELETE)
  return next();
};
var allowCrossTokenHeaders = (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "*"); // Mejor acotar (Content-type)
  return next();
};
var auth = (req, res, next) => {
  // declaramos la función auth
  if (!req.headers.token) {
    // si no se envía el token...
    res.status(401).json({
      result: "NO",
      msg: "Envía un código válido en la cabecera 'token'",
    });
    return;
  }
  const queToken = req.headers.token; // recogemos el token de la cabecera llamada “token”
  if (queToken === accessToken) {
    // si coincide con nuestro password...
    return next(); // continuamos con la ejecución del código
  } else {
    // en caso contrario...
    res.status(401).json({ result: "NO", msg: "No autorizado" });
  }
};



// routes
app.param("coleccion", (req, res, next, coleccion) => {
  req.collection = db.collection(coleccion);
  return next();
});
app.get("/api", (req, res, next) => {
  db.getCollectionNames((err, colecciones) => {
    if (err) return next(err);
    res.json(colecciones);
  });
});
app.get("/api/:coleccion", (req, res, next) => {
  req.collection.find((err, coleccion) => {
    if (err) return next(err);
    res.json(coleccion);
  });
});
app.get("/api/:coleccion/:id", (req, res, next) => {
  const elementoId = req.params.id;
  req.collection.findOne({ _id: id(elementoId) }, (err, elementoRecuperado) => {
    if (err) return next(err);
    res.json(elementoRecuperado);
  });
});
app.post("/api/:coleccion", auth, (req, res, next) => {
  const nuevoElemento = req.body;
  req.collection.save(nuevoElemento, (err, coleccionGuardada) => {
    if (err) return next(err);
    res.json(coleccionGuardada);
  });
});
app.put("/api/:coleccion/:id", auth, (req, res, next) => {
  const elementoId = req.params.id;
  const nuevosRegistros = req.body;
  req.collection.update(
    { _id: id(elementoId) },
    { $set: nuevosRegistros },
    { safe: true, multi: false },
    (err, result) => {
      if (err) return next(err);
      res.json(result);
    }
  );
});
app.delete("/api/:coleccion/:id", auth, (req, res, next) => {
  const elementoId = req.params.id;
  req.collection.remove({ _id: id(elementoId) }, (err, resultado) => {
    if (err) return next(err);
    res.json(resultado);
  });
});



// Iniciamos la aplicación
https
  .createServer(
    {
      cert: fs.readFileSync("./cert/cert.pem"),
      key: fs.readFileSync("./cert/key.pem"),
    },
    app
  )
  .listen(port, function () {
    console.log(
      `API RESTful CRUD ejecutándose en https://localhost:${port}/api/{colecciones}/{id}`
    );
  });

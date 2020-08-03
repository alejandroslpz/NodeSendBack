const Enlaces = require("../models/Enlace");
const shortid = require("shortid");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

exports.nuevoEnlace = async (req, res, next) => {
  // Mostrar mensajes de error de Express Validator

  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  // Creacion de objeto
  const { nombre_original, nombre } = req.body;

  const enlace = new Enlaces();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;

  // Si el usuario está autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;

    // Asignar a enlace el numero de descargas
    if (descargas) {
      enlace.descargas = descargas;
    }

    // Asignar un password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      enlace.password = await bcrypt.hash(password, salt);
    }

    // Asignar el autor
    enlace.autor = req.usuario.id;
  }

  // Guardar en bd
  try {
    await enlace.save();
    return res.json({ msg: `${enlace.url}` });
    next();
  } catch (error) {
    console.log(error);
  }
};

// Obtiene un listado de todos los enlaces

exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlaces.find({}).select("url -_id");
    res.json(enlaces);
  } catch (error) {
    console.log(error);
  }
};

// Verificar si tienes password

exports.tienePassword = async (req, res, next) => {
  // Verificar si existe el enlace

  const { url } = req.params;

  console.log(url);

  const enlace = await Enlaces.findOne({ url });

  if (!enlace) {
    res.status(404).json({ msg: "El enlace no existe" });
    return next();
  }

  if (enlace.password) {
    res.json({ password: true, enlace: enlace.url });
  }

  next();
};

// Verifica si el password es correcto

exports.verificarPassword = async (req, res, next) => {
  const { url } = req.params;
  const { password } = req.body;
  // Consultar por el enlace

  const enlace = await Enlaces.findOne({ url });

  // Verificar password

  if (bcrypt.compareSync(password, enlace.password)) {
    // Permitir descargar archivo
    next();
  } else {
    return res.status(401).json({ msg: "Password Incorrecto" });
  }
};

// Obtener el enlace

exports.obtenerEnlace = async (req, res, next) => {
  // Verificar si existe el enlace

  const { url } = req.params;

  console.log(url);

  const enlace = await Enlaces.findOne({ url });

  if (!enlace) {
    res.status(404).json({ msg: "El enlace no existe" });
    return next();
  }

  // Si el enlace existe
  res.json({ archivo: enlace.nombre, password: false });

  next();
};

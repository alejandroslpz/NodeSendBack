const multer = require("multer");
const shortid = require("shortid");
const fs = require("fs");
const path = require("path");
const Enlaces = require("../models/Enlace");

exports.subirArchivo = async (req, res, next) => {
  const configuracionMulter = {
    limits: { fileSize: req.usuario ? 1024 * 1024 * 10 : 1024 * 1024 },
    storage: (fileStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, (__dirname = "./uploads"));
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.substring(
          file.originalname.lastIndexOf("."),
          file.originalname.length
        );
        cb(null, `${shortid.generate()}${extension}`);
      },
    })),
  };

  const upload = multer(configuracionMulter).single("archivo");

  upload(req, res, async (error) => {
    console.log(req.file);
    if (!error) {
      res.json({ archivo: req.file.filename });
    } else {
      console.log(error);
      return next();
    }
  });
};

exports.eliminarArchivo = async (req, res, next) => {
  console.log(req.archivo);

  try {
    fs.unlinkSync(path.join(__dirname, `../uploads/${req.archivo}`));
    console.log("Archivo eliminado");
  } catch (error) {
    console.log(error);
  }
};

// Descarga un archivo

exports.descargar = async (req, res, next) => {
  // Obtener el enlace

  const { archivo } = req.params;
  const enlace = await Enlaces.findOne({ nombre: archivo });
  const archivoDescarga = path.join(__dirname, `../uploads/${archivo}`);

  res.download(archivoDescarga);

  // Eliminar el archivo y la entrada a la base de datos
  const { descargas, nombre } = enlace;

  // Descargas son iguales a 1
  if (descargas === 1) {
    // Eliminar el archivo
    req.archivo = nombre;
    // Eliminar de bd
    await Enlaces.findOneAndRemove(enlace.id);
    next();
  } else {
    // Si hay mas de 1 descarga disminui en 1
    enlace.descargas--;
    await enlace.save();
  }
};

const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const { check } = require("express-validator");

router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("email", "Agrega un email valido").isEmail(),
    check("email", "El password debe de ser de 6 caractares o más").isLength({
      min: 6,
    }),
  ],

  usuarioController.nuevoUsuario
);

module.exports = router;
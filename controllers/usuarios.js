const { response, request } = require('express');
const bcryptjs = require('bcryptjs');

const Usuario = require('../models/usuario');

const usuariosGet = async (req = request, res = response) => {

    const {
        limite = 5,
        desde = 0,
    } = req.query;

    const query = { estado: true };

    const [ total, usuarios ] = await Promise.all([
        Usuario.countDocuments(query),
        Usuario.find(query)
            .skip(Number( desde ))
            .limit(Number( limite ))
    ]);

    res.json({
        total,
        usuarios,
    });
};

const usuariosPost = async (req, res) => {

    const {
        nombre,
        correo,
        password,
        rol
    } = req.body;
    const usuario = new Usuario({ nombre, correo, password, rol });

    // Encriptar la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync( password, salt );

    // Guardar en BD
    await usuario.save();

    res.status(201).json(usuario);
};

const usuariosPut = async(req, res) => {

    const { id } = req.params;
    const { _id, password, google, correo, ... resto  } = req.body;

    if( password ) {
        // Encriptar la contraseña
        const salt = bcryptjs.genSaltSync();
        resto.password = bcryptjs.hashSync( password, salt );
    }

    const usuario = await Usuario.findByIdAndUpdate( id, resto );

    res.status(200).json(usuario);
};

const usuariosPatch = (req, res) => {
    res.json({
        msg: 'Patch API - Controller'
    });
};

const usuariosDelete = async(req, res) => {

    const { id } = req.params;

    // Fisicamente lo borramos
    const usuario = await Usuario.findByIdAndUpdate(id, { estado: false });

    res.status(200).json( usuario );
};


module.exports = {
    usuariosGet,
    usuariosPost,
    usuariosPut,
    usuariosPatch,
    usuariosDelete,
}
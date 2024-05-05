const { response } = require("express");
const { generarJWT } = require('../helpers/generar-jwt');

const Usuario = require('../models/usuario');
const bcryptjs = require('bcryptjs');
const { googleVerify } = require("../helpers/google-verify");
const usuario = require("../models/usuario");

const login = async(req, res = response) => {

    const {
        correo,
        password
    } = req.body;

    try {

        // Verificar si el email existe
        const usuario = await Usuario.findOne({ correo });
        if( !usuario )
            return res.status(400).json({ 
                msg: `El usuario con el correo ${ correo } no existe.`
            });

        // Verificar está activo
        if( !usuario.estado )
            return res.status(400).json({ 
                msg: `Usuario o Password no son correctos.`
            });

        // Verificar la contraseña
        const validPassword = bcryptjs.compareSync( password, usuario.password );
        if( !validPassword )
            return res.status(400).json({ 
                msg: `Usuario o Password no son correctos.`
            });

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.status(200).json({
            usuario,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Algo salio mal'
        })
    }

}

const googleSignIn = async( req, res = response) => {
    const { id_token } = req.body;

    try {
        const { correo, nombre, img } = await googleVerify( id_token );
        let usuario = await Usuario.findOne({ correo });

        if( !usuario ) {
            // Crearlo
            const data = {
                nombre,
                correo,
                password: ':D',
                img,
                rol: 'USER_ROLE',
                google: true
            };

            usuario = new Usuario( data );
            await usuario.save();
        }

        // Si el usuario en BD
        if( !usuario.estado )
            return res.status(401).json({ msg: 'El usuario se encuentra INACTIVO en el sistema' });

        // Generar el JWT
        const token = await generarJWT( usuario.id );

        res.status(200).json({
            usuario,
            token
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: 'Algo salio mal'
        })
    }
}


module.exports = {
    login,
    googleSignIn
}
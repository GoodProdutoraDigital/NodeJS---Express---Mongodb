const localStr = require('passport-local')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//model usuario
require('../models/Usuario')

const Usuario = mongoose.model('usuarios')

module.exports = function(passport){                     
    //utilizando chaves para autenticação                                  //callback functions 
    passport.use(new localStr({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Usuario.findOne({email: email}).then((usuario) => {
            //usuario não existe
            if(!usuario){
                //done callback function
                //param (verifica dados)
                //param (verifica autenticação)
                //param (retorna mensagem)
                return done(null, false, {message: 'Usuário ou senha inválidos'})
            }

            //comparar senha com senha do usuario encontrado
            bcrypt.compare(senha, usuario.senha, (error, passOk) => {
                if(passOk){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: 'Usuário ou senha inválidos'})
                }
            })
        })
    }))

    //Dados serão guardados em sessão ao realizar login
    passport.serializeUser((usuario, done) => {
        console.log('passport : serialize')
        done(null, usuario.id)
    })

    passport.deserializeUser((id, done) => {
        console.log('passport : deserialize')
        Usuario.findById(id, (error, usuario) => {
            done(error, usuario)
        })
    })
}
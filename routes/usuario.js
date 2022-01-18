const express = require('express')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const passport = require('passport')

require('../models/Usuario')

const router = express.Router()
const Usuario = mongoose.model('usuarios')


router.get('/registro', (req, res) => {
    res.render('user/usuarios/registro')
})

router.post('/registro', (req, res) => {
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Nome inválido'})
    }
    if(!req.body.email || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Email inválido'})
    }
    if(!req.body.senha || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: 'Senha inválida'})
    }
    if(req.body.senha.length < 8){
        erros.push({texto: 'Senha deve conter no mínimo 8 dígitos'})
    }
    if(req.body.senha != req.body.senha2){
        erros.push({texto: 'A senha deve ser igual'})
    }

    if(erros.length > 0){
        res.render('user/usuarios/registro', {erros: erros})
    }else{
        //verifica se já cadastrado no banco de dados
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash('error_msg', 'Erro ao cadastrar o email, tente novamente')
                res.redirect('/user/registro')
            }else{
                //Objeto usuario
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                //Utilizando bcrypt
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                        if(erro){
                            req.flash('error_msg', 'Erro ao cadastrar novo Usuário')
                            res.redirect('/user/registro')
                        }

                        novoUsuario.senha = hash
                        novoUsuario.save().then(() => {
                            req.flash('success_msg', 'Usuário cadastrado com Sucesso')
                            res.redirect('/')
                        }).catch((erro) => {
                            req.flash('error_msg', 'Erro ao cadastrar novo usuário, tente novamente')
                            res.redirect('/user/registro')
                        })

                    })
                })
            }   
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao cadastrar')
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('user/usuarios/login') 
})

//autenticação passport
router.post('/login', (req, res, next) => {
    passport.authenticate('local', 
    {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true

    })(req, res, next)
})

//passport logout
router.get('/logout', (req, res) => {
    req.logOut()
    req.flash('success_msg', 'Desconectado com Sucesso')
    res.redirect('/')
})
module.exports = router
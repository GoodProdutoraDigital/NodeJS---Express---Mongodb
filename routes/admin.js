const express = require('express')
const mongoose = require('mongoose')
//utilizando model
require('../models/Categoria')
require('../models/Postagem')
//utilizando helpers
const {admin} = require('../helpers/_auth')
//ref model a variável
const Categoria = mongoose.model('categorias')
const Postagem = mongoose.model('postagens')
const router = express.Router()

//Rotas categorias


router.get('/', admin, (req, res) => {    
    res.render('admin/index')
})

router.get('/categorias', admin, (req, res) => {
        Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', {categorias: categorias.map(categorias => categorias.toJSON())})
    }).catch((err) => {
        req.flash('error_msg', 'Erro ao listar categorias!')
        res.redirect('/')
    })
})

router.get('/categorias/add', admin, (req, res) => {
    res.render('admin/addcategorias')
})

router.post('/categorias/nova', admin, (req, res) => {

    //validação
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        //função push: inserir dados dentro do array criado acima
        erros.push({texto: 'Nome inválido'})
    }
    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: 'Slug inválido'})
    }
    if(erros.length > 0){        
        res.render('admin/addcategorias', {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
            new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso')       
            res.redirect('/admin/categorias')            
        }).catch((err) => {
            req.flash('error_msg', 'Erro ao criar nova categoria!')
            res.redirect('/admin')
        })
    }
})

router.get('/categorias/edit/:id', admin, (req, res) => {
    Categoria.findOne({_id: req.params.id}).then((categorias) => {
        res.render('admin/editcategorias', {categorias: categorias})
    }).catch((erro) => {
        req.flash('error_msg', 'Categoria não existe!')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/edit', admin, (req, res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {

        //collection esta recebendo os valores do body
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
       
            categoria.save().then(() => {
            req.flash('success_msg', 'Categoria editada com sucesso')
            res.redirect('/admin/categorias')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar a categoria')
            res.redirect('/admin/categorias')

        })        

    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar a categoria')
        res.redirect('/admin/categorias')
    })
})

router.post('/categorias/deletar', admin, (req, res) => {
    Categoria.remove({_id: req.body.id}).then(() => {
        
        req.flash('success_msg', 'Categoria deletada com sucesso')
        res.redirect('/admin/categorias')

    }).catch(() => {
        req.flash('msg_error', 'Erro ao deletar categoria')
        res.redirect('/admin/categorias')  
    })
})

//Rotas Postagem

router.get('/postagens', admin, (req, res) => {
    Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao listar postagens!')
        res.redirect('/')
    })    
})

router.get('/postagens/add', admin, (req, res) => {
    //buscando categorias para visualizar no formulario    
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', {categorias: categorias})
    }).catch(() => {
        req.flash('error_msg', 'Erro ao carregar postagem')
        res.redirect('/admin/postagens')
    })
    
})

router.post('/postagens/nova', admin, (req, res) => {
    var erros = []

    if (req.body.categoria == '0'){
        erros.push({texto: 'Categoria invalida, cadastre uma nova categoria'})
    }
    if (erros.length > 0){
        res.render('/admin/addpostagem', {erros: erros})
    }else{
        const novaPostagen = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagen).save().then(() => {
            req.flash('success_msg', 'Postagem adicionada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao adicionar um nova postagem!')
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', admin, (req, res) => {
    //realizando 2 consultas
    Postagem.findOne({_id: req.params.id}).then((postagens) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagens', {categorias: categorias, postagens: postagens})
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao listar as categorias')
            res.redirect('/admin/postagens')
        })    

    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao carregar o formulário para edição')
        res.redirect('/admin/postagens')
    })
    
})

router.post('/postagens/edit', admin, (req, res) => {
    
    Postagem.findOne({_id: req.body.id}).then((postagens) => {

        postagens.titulo = req.body.titulo
        postagens.slug = req.body.slug
        postagens.descricao = req.body.descricao
        postagens.conteudo = req.body.conteudo
        postagens.categoria = req.body.categoria
        postagens.data = new Date
        postagens.save().then(() => {
            req.flash('success_msg', 'Postagem editada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao editar postagem')
            res.redirect('admin/postagens')
        })


    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao editar postagem')
        res.redirect('/admin/postagens')
    })    
})

router.post('/postagens/deletar', admin, (req, res) => {
    Postagem.remove({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com Sucesso')
        res.redirect('/admin/postagens')
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar postagem')
        res.redirect('/admin/postagens')
    })
})

module.exports = router
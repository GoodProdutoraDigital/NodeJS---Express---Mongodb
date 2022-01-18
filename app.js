//carregando modulos
    //framework backand para web aplications
    const express = require('express')
    //template engine
    const handlebars = require('express-handlebars')
    //middleware http
    const bodyparser = require('body-parser')
    //responsavel pela conexão com mongodb
    const mongoose = require('mongoose')
    //gerencia sessões de um middleware    
    const session = require('express-session')
    //mensagens instantâneas ao redirecionar entre paginas
    const flash = require('connect-flash')
    //middleware autentication
    const passport = require('passport')    
    require('./config/auth')(passport)
    //config mongodb
    const db = require('./config/db')


    //models
    require('./models/Postagem')
    const Postagem = mongoose.model('postagens')
    require('./models/Categoria')
    const Categoria = mongoose.model('categorias')

//manipualar diretorios
    const patch = require('path')

//app
    const app = express()

//config's
    //definição sessão (test)
    app.use(session({
        secret: 'secretexpresssessionnodejs',
        resave: true,
        saveUninitialized: true        
    }))
    //definição passport
    app.use(passport.initialize())
    app.use(passport.session())
    //definição flash 
    app.use(flash())    
    //midlleware config
    app.use((req, res, next) => {
        //variavel global
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        next()
    })
    //bodyparser
    app.use(bodyparser.urlencoded({extended: true}))
    app.use(bodyparser.json())
    //handlebars   
    const hand = handlebars.create({defaultLayout: 'main', runtimeOptions:{
        allowProtoMethodsByDefault: true,
        allowProtoPropertiesByDefault: true
    }})
    app.engine('handlebars', hand.engine)
    app.set('view engine', 'handlebars')    
    //mongoose
    mongoose.Promise = global.Promise
    mongoose.connect(db.mongoURI).then(() => {
        console.log('executando database')
    }).catch((erro) => {
        console.log('Erro ao conectar mongodb: ' + erro)
    })

//public
    app.use(express.static(patch.join(__dirname, 'public')))

//middleware
    app.use((req, res, next) => {
        console.log('executando middleware')
        next()
    })

//rota home (index)
    app.get('/', (req, res) => {
        Postagem.find().populate('categoria').sort({data: 'desc'}).then((postagens) => {
            res.render('home/index', {postagens: postagens})
        }).catch((erro) => {
            req.flash('msg_error', 'index error!')
            res.redirect('/404')
        }) 
    })

//rota postagens (index)
    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({slug: req.params.slug}).then((postagem) => {
            if(postagem){
                res.render('user/postagens/index', {postagem: postagem})
            }else{
                req.flash('error_msg', 'Postagem não existe')
                res.redirect('/')
            }   
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    })

// rota categorias (index)
    app.get('/categorias', (req, res) => {
        Categoria.find().then((categoria) => {
            res.render('user/categorias/index', {categoria: categoria})
            req.flash('success_msg', 'Categorias listadas com sucesso')
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao listar categorias')
            res.redirect('/')
        })
    })

//rota categorias (postagens)
    app.get('/categoria/:slug', (req, res) => {
        Categoria.findOne({slug: req.params.slug}).then((categoria) => {
            if(categoria){
                Postagem.find({categoria : categoria._id}).then((postagens) => {
                    res.render('user/categorias/postagens', {postagens : postagens, categoria : categoria})
                }).catch((erro) => {
                    req.flash('error_msg', 'Erro ao listar postagem')
                    res.redirect('/')
                })
            }else{
                req.flash('error_msg', 'Esta categoria não existe')
                res.redirect('/')
            }
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao listar categorias')
            res.redirect('/')
        })
    })

//rota 404
    app.get('/404', (req, res) => {
        res.send('Erro 404')
    })

//conjunto de rotas
    const admin = require('./routes/admin') 
    const user = require('./routes/usuario')
        
    app.use('/admin', admin)
    app.use('/user', user)

//outros
    const PORT = process.env.PORT || 3333
    app.listen(PORT, () => {
        console.log('executando servidor http://localhost:' + PORT)
    })
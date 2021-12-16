const mongoose = require('mongoose')

//definir schema
const Schema = mongoose.Schema

const Categoria = new Schema({
    nome:{
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

//compile model from schema
mongoose.model('categorias', Categoria)
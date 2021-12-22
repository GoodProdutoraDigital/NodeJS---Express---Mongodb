if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://neoinfo:Sc6rTjmkx4V6FZop@cluster0.fdcam.mongodb.net/blogapp?retryWrites=true&w=majority'}
}else{
    //module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
    module.exports = {mongoURI: 'mongodb+srv://neoinfo:Sc6rTjmkx4V6FZop@cluster0.fdcam.mongodb.net/blogapp?retryWrites=true&w=majority'}
}
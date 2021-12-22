if(process.env.NODE_ENV == 'production'){
    module.exports = {mongoURI: 'mongodb+srv://user:password@cluster0.fdcam.mongodb.net/blogapp?retryWrites=true&w=majority'}
}else{
    module.exports = {mongoURI: 'mongodb://localhost/blogapp'} 
}
//Verificar usuario autenticado e nivel de acesso

module.exports = {
    admin: function(req, res, next){
        if(req.isAuthenticated() && req.user.admin == 1){
            return next()
        }
        req.flash('error_msg', 'Necessário nível administrador')
        res.redirect('/')        
    }
}
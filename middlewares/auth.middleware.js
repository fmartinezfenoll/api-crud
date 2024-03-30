function auth( req, res, next ) {
    // Comprobamos que han enviado el token tipo Bearer en el Header
    if ( !req.headers.authorization ) {
    return res.status(401).send( {
    result: 'KO',
    message: 'Cabecera de autenticación tipo Bearer no encontrada [Authorization: Bearer jwtToken]'
    });
    };
    const token = req.headers.authorization.split(' ')[1]; // El formato es: Authorization: "Bearer JWT"
    // Comprobamos que han enviado el token
    if ( !token ) {
    return res.status(401).send( {
    result: 'KO',
    message: 'Token de acceso JWT no encontrado dentro de la cabecera [Authorization: Bearer jwtToken]'
    });
    };
    // Verificamos que el token es correcto
    TokenHelper.decodificaToken(token)
    .then( userId => {
    req.user = {
    id: userId,
    token: token
    };
    return next();
    })
    .catch( response => {
    res.status(response.status);
    res.json({
    result: 'KO',
    message: response.message
    });
    });
   } 
   module.exports = {
    auth
   };    
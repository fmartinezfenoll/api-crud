module.exports = {
    PORT: process.env.PORT || 4000,
    DB: process.env.MONGODB || 'mongodb://localhost:27017/SD',
    SECRET: 'miclavesecreta',
    TOKEN_EXP_TIME: 7*24*60 // 7 días expresados en minutos
   } 
   
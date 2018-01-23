process.title = 'TTT Server';
   
  //Importando ExpressJS
  var express = require('express'),

      //Criando uma instancia do ExpressJS
      app = express(),

      http = require('http').Server(app),
      
      //Importando Socket.IO
      io = require('socket.io')(http),
   
      
      port = process.env.PORT || 8000;
      //Criando um HTTP Server a partir do ExpressJS
      //httpServer = require('http').createServer(app),
   
      //Utilizando a mesma porta do HTTP Server para o Socket.IO
      //io = socketio.listen(httpServer)
  app.use(express.static('public'));
   
  //Diz ao Express// que o diretório web contém conteúdos estáticos
  //app.use(express.//static(__dirname + '/public'));
 //  
 // //Exporta os módulos
  module.exports.socketServer = io;
  module.exports.webServer = http//r;   




  //var express = require('express'),
    //app = express(),
    //http = require('http').Server(app),
    //io = require('socket.io')(http),
    //port = process.env.PORT || 5000;

//app.use(express.static('public'));
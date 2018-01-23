//Carrega o módulo server.js
  var Server = require('./backend'),
   
  //Carrega o objeto io
  socketServer = Server.socketServer,
   
  //Carrega o objeto httpServer
  webServer = Server.webServer,
   
  UserHandling = require('./server'),
   
  userHandling = new UserHandling(socketServer);
   
  //Inicia o web server na porta 9000
  webServer.listen(8000);
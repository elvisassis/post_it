process.title = 'TTT Server';

//Importando ExpressJS
var express = require('express'),

	//Criando uma instancia do ExpressJS
    app = express(),

	//Criando um HTTP Server a partir do ExpressJS
    http = require('http').Server(app),

    //Importando Socket.IO
    io = require('socket.io')(http),

	UserHandling = require("./server"),

	userHandling = new UserHandling(io),

    porta = process.env.PORT || 8000;

//Diz ao Express que o diretório 'public' contém conteúdos estáticos
app.use(express.static('public'));
// app.use('/teste', express.static(__dirname + '/node_modules/')); 

http.listen(porta, function(){
	console.log("Servidor iniciado com sucesso!\nEscutando na porta "+porta);
});

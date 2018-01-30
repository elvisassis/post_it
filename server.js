var UserHandling = module.exports = function(io) {
	//Mantem controle dos "likes" para cada post
	this.posts = {};

	//Referencia o objeto do servidor web SocketIO
	this.io = io;

	//Mantem as referencias aos sockets dos clientes conectados
	this.loggedUsers = {};

	//Inicializa a conexão com o cliente por meio do SocketIO
	this.init();
};

UserHandling.prototype = {

	init: function() {
		var that = this;

		//Evento disparado quando um novo cliente se conecta com sucesso ao servidor.
		this.io.on('connection', function(client) {

			client.on('disconnect', function() {
				that.onDisconnect(client);
			});

			//Vincula os eventos emitidos pelo cliente
			that.bindEvents(client);
			//Atualiza a lista de clientes conectados
			that.onUserList(client);
		});
	},

	bindEvents: function(client) {
		var that = this;

		client.on('userlogin', function(data) {
			that.onUserLogin(client, data);
		});

		// client.on('userlist', function(data) {
		// 	that.onUserList(client, data);
		// });

		client.on('makepost', function(data) {
			console.log(data);
			that.onMakePost(client, data);
		});

		client.on('makecomment', function(data) {
			that.onMakeComment(client, data);
		});

		client.on('likepost', function(data) {
			that.onLikePost(client, data);
		});

		client.on('likecomment', function(data) {
			that.onLikeComment(client, data);
		});

	},

	onDisconnect: function(client) {
		delete this.loggedUsers[client.id]; //Remove o usuário desconectado da lista
		this.onUserList(client);
	},

	sendMessage: function(client, tipo, msg) {
		client.emit('msg', {text: msg, type: tipo});
	},

	onUserLogin: function(client, data) {
		var that = this;

		if(data.nome) {
			client.handshake.nome = data.nome;
			that.loggedUsers[client.id] = client; //Adiciona um novo cliente à lista
			// console.log("dados usuario logado " + client.id);
			//Envia a confirmação que o usuário está logado.
			client.emit('userlogin', {nome: data.nome, id: client.id});
			//Envia a lista de usuário atualizada para o cliente
			that.onUserList(client);
		} else {
			//Envia uma mensagem de erro para o cliente
			this.sendMessage(client, 'error', 'O nome do usuário é obrigatório!');
		}
	},

	/**
	 * Envia a lista de usuários atualizada para todos clientes conectados.
	 * @param {Object} client - Referencia à um cliente conectado
	 * @param {} data - SEM USO POR ENQUANTO.
	 */
	onUserList: function(client, data) {
		var that = this,

		/**
		 * Object.keys - Ordena as propriedades enumeráveis de um objeto
		 * @var {Object} keys - Contém somente as propriedades enumeráveis de
		 *	um objeto ordenas.
		 */
		keys = Object.keys(this.loggedUsers),
		/**
		 * Cria um novo array com o tamanho igual a keys.length
		 * @var {Object} userList
		 */
		userList = new Array(keys.length),
		i = 0;

		/**
		 * Transfere os usuários logados para um novo array para tirar as lacunas
		 * do array
		 */
		keys.forEach(function(k) {
			userList[i++] = {
				id: k,
				nome: that.loggedUsers[k].handshake.nome
			};
		});

		//Envia a lista de usuários logados para o cliente em questão
		client.emit('userlist', userList);
		//Envia a lista de usuários logados para todos os outros clientes conectados
		client.broadcast.emit('userlist', userList);
	},

	onMakePost: function(client, data) {
		var id = Date.now(),
		postData = {
			author: client.handshake.nome,
			authorId: client.id,
			hora: id,
			id: id,
			text: data,
			likeCount: 0,
			comentarios: []
		};

		console.log(postData);

		//cadastra o post no controle de likes
		this.posts[id+''] = 0;

		client.emit('makepost', postData);
		client.broadcast.emit('makepost', postData);
	},

	onMakeComment: function(client, data) {
		var id = Date.now(),
		commentData = {
			author: client.handshake.nome,
			authorId: client.id,
			hora: Date.now(),
			text: data.text,
			postId: data.postId,
			id: id
		};

		//cadastra o post no controle de likes
		this.posts[id+''] = 0;

		client.emit('makecomment', commentData);
		client.broadcast.emit('makecomment', commentData);
		console.log(commentData);
	},

	onLikePost: function(client, data) {
		var likeCount = this.posts[data.postId+''];

		if(data.like) {
			likeCount += 1;
		} else {
			likeCount -= 1;
		}

		this.posts[data.postId+''] = likeCount;



		client.emit('likepost', {postId: data.postId, numLikes: likeCount});
		client.broadcast.emit('likepost', {postId: data.postId, numLikes: likeCount});
	},

	onLikeComment: function(client, data) {
		var likeCount = this.posts[data.commentId+''];

		if(data.like) {
			likeCount += 1;
		} else {
			likeCount -= 1;
		}

		this.posts[data.commentId+''] = likeCount;

		client.emit('likecomment', {commentId: data.commentId, numLikes: likeCount});
		client.broadcast.emit('likecomment', {commentId: data.commentId, numLikes: likeCount});
	}


};

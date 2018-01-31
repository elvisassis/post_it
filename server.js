var DatabaseServiceUser = require("./databaseServiceUser");
var databaseServiceUser = new DatabaseServiceUser();

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

		client.on('userlogin', function(loginData) {
			that.onUserLogin(client, loginData);
		});

		client.on('makepost', function(data) {
			// console.log(data);
			that.onMakePost(client, data);
		});

		client.on('makecomment', function(comentario) {
			that.onMakeComment(client, comentario);
		});

		client.on('likepost', function(data) {
			that.onLikePost(client, data);
		});

		client.on('likecomment', function(data) {
			that.onLikeComment(client, data);
		});

		client.on("newuser", function(novoUsuarioData){
			that.onNewUser(client, novoUsuarioData);
		});
	},

	onDisconnect: function(client) {
		delete this.loggedUsers[client.id]; //Remove o usuário desconectado da lista
		this.onUserList(client);
	},

	sendMessage: function(client, tipo, msg) {
		client.emit('msg', {text: msg, type: tipo});
	},

	onUserLogin: function(client, loginData) {
		var that = this;

		if(loginData.login && loginData.senha) {
			databaseServiceUser.verifyUser(loginData, (usuario) => {
				if (usuario) {
					client.handshake.nome = usuario.nome;
					that.loggedUsers[client.id] = client; //Adiciona um novo cliente à lista
					//Envia a confirmação que o usuário está logado.
					client.emit('userlogin', {nome: usuario.nome, id: usuario._id});
					//Envia a lista de usuário atualizada para o cliente
					that.onUserList(client);
				} else {
					//Envia uma mensagem de erro para o cliente
					this.sendMessage(client, 'error', 'Login e/ou senha estão incorretos!');
				}
			});
		} else {
			//Envia uma mensagem de erro para o cliente
			this.sendMessage(client, 'error', 'Login e senha são obrigatórios!');
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
		var id = Date.now(), //Foi utilizado o timestamp da hora do post como identificador único para cada post.
				// Cria um post
				postData = {
					author: client.handshake.nome,
					authorId: client.id,
					hora: id,
					id: id,
					text: data,
					isComentario: false,
					likeCount: 0,
					comentarios: []
				};

		// console.log(postData);

		//cadastra o post no controle de likes
		this.posts[id+''] = 0;

		//Envia para todos os clientes que foi realizado um novo post
		client.emit('makepost', postData);
		client.broadcast.emit('makepost', postData);
	},

	onMakeComment: function(client, comentario) {
		var id = Date.now(), //timestamp da hora do comentário como identificador único para cada comentário.
				commentData = {
					author: client.handshake.nome,
					authorId: client.id,
					hora: id,
					text: comentario.text,
					postId: comentario.postId,
					id: id,
					likeCount: 0
				};

		//cadastra o post no controle de likes
		this.posts[id+''] = 0;

		//Envia para todos os clientes que foi realizado um novo comentário
		client.emit('makecomment', commentData);
		client.broadcast.emit('makecomment', commentData);
		// console.log(commentData);
	},

	onLikePost: function(client, likeData) {
		var likeCount = this.posts[likeData.postId+'']; //Quantidade total de "likes" do post.

		//Verifica se é pra remover ou adicionar o "like".
		if (likeData.like) {
			likeCount += 1;
		} else {
			likeCount -= 1;
		}

		//Atualiza a quantidade total de like do post.
		this.posts[likeData.postId+''] = likeCount;

		//Envia para todos os clientes a atualização do "like"
		client.emit('likepost', {postId: likeData.postId, numLikes: likeCount});
		client.broadcast.emit('likepost', {postId: likeData.postId, numLikes: likeCount});
	},

	onLikeComment: function(client, data) {
		//Pega a quantidade total de likes do comentário
		var likeCount = this.posts[data.commentData.id+''];

		//Verifica se é para remover ou adicionar o "like", isso é, se o usuário já deu "like"
		if(data.like) {
			likeCount += 1;
		} else {
			likeCount -= 1;
		}

		//Atualiza o total de "Likes"
		this.posts[data.commentData.id+''] = likeCount;

		//Envia para todos clientes o like atualizado.
		client.emit('likecomment', {postId:data.commentData.postId, commentId: data.commentData.id, numLikes: likeCount});
		client.broadcast.emit('likecomment', {postId:data.commentData.postId, commentId: data.commentData.id, numLikes: likeCount});
	},

	onNewUser: function(client, novoUsuarioData) {
		var that = this;

		if (novoUsuarioData.nome && novoUsuarioData.login && novoUsuarioData.senha) {
			//Cadastra usuário no banco de dados
			databaseServiceUser.create(novoUsuarioData, function(err){
				if (err) {
					client.emit("newuser", {err: err, msg: "Erro: Falha na inserção no banco de dados!"});
				} else {
					client.emit("newuser", {err: err, msg: "Usuário cadastrado com sucesso!"});
				}
			});
		} else {
			that.sendMessage(client, 'error', 'Todos campos são obrigatórios!');
		}
	}
};

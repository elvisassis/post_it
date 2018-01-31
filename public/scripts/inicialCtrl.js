postIt.controller('InicialCtrl', function($scope){
	var socket = io();

	// Inicializa as variáveis utilizadas
	$scope.isLogado = false;
	$scope.postCount = 0;
	$scope.posts = []; //Mantem todos os posts
	$scope.usuarioLogado = null; //Objeto que contém os dados do usuário logado.
	$scope.login = {nome:"", senha:""};
	$scope.novoUsuario = {};
	$scope.post = "";
	$scope.comentario = "";
	$scope.usuariosOnline = [];

	//DADOS PARA TESTE
	// $scope.nome = "Márcio";
	// $scope.post = "Post de teste";
	// $scope.comentario = "Comentário de teste";

	init();

	function init(){
		// ########################### LISTENERS ###########################
		socket.on('msg', function(data) {
			console.log(data);
		});

		socket.on('userlogin', function(data) {
			$scope.usuarioLogado = data; //Armazena os dados do usuário logado.
			$scope.isLogado = true;
		});

		socket.on('userlist', function(data) {
			//Recebe a lista atualizada dos usuário online.
			$scope.usuariosOnline = data;
			// console.log(data);
			$scope.$apply(); //Atualiza as alterações
		});

		socket.on('makepost', function(postData) {

			post(postData);
			$scope.$apply(); //Atualiza a visão
		});

		socket.on('makecomment', function(commentData) {

			commentData.hora = formatarHora(commentData.hora);

			//Percorre todos os posts cadastrados
			$scope.posts.forEach(function(post){
				if (post.id == commentData.postId) { //Verifica se o post do comentário existe
					post.comentarios.push(commentData); //Adiciona o comentário ao post.
				}
			});

			$scope.$apply();
		});

		socket.on('likepost', function(data) {
			// var index = _.findIndex($scope.posts, {id: data.postId});
			var post = getPostById(data.postId);

			if (post != null) {
				post.likeCount = data.numLikes;
			}

			// $scope.posts[index].likeCount = data.numLikes;
			$scope.$apply();
		});

		socket.on('likecomment', function(data) {
			var post = getPostById(data.postId);

			//Verifica se o post existe
			if (post != null) {
				//Percorre todos os comentários do post
				post.comentarios.forEach(function(comentario){
					if (comentario.id == data.commentId) { //Verifica se o comentário existe
						comentario.likeCount = data.numLikes; //Atualiza a quantidade de comentários
					}
				});
			}

			$scope.$apply();
		});

		socket.on("newuser", function(data){
			alert(data.msg);

			if (!data.err) {
				$scope.novoUsuario.nome = "";
				$scope.novoUsuario.login = "";
				$scope.novoUsuario.senha = "";
				$("#modalCadastro").modal('hide');
				$scope.$apply();
			}
		});
	}

	// ########################### EMITTERS ###########################
	$scope.userLogin = function () {
		if ($scope.login.nome.trim() == "" || $scope.login.senha.trim() == "") {
			alert("O nome é obrigatório!");
			return;
		}

		socket.emit('userlogin', $scope.login);
	}

	$scope.postar = function(post) {
		if (!post) return;

		socket.emit('makepost', post);
		$scope.post = "";
	}

	//Insere novo comentário ao post
	$scope.newComment = function(comentario, postId) {
		if (comentario.trim() == "") {
			alert("Insira um comentário.");
			return;
		}

		$scope.posts.forEach(function(post){
			if (post.id == postId) {
				post.isComentario = false; //Desabilita o formulário de comentário.
			}
		});

		socket.emit('makecomment', {text: comentario, postId: postId});
		$scope.comentario = ""; //Limpa o formulário de comentário
	}

	$scope.likePost = function(postId, authorId, likeCount) {
		var like;

		// Verifica se o usuário logado já deu "like" no post.
		if (authorId === this.usuarioLogado.id && likeCount > 0) {
			like = false; //Indica a remoção do "like"
		} else {
			like = true; //Indica a adição do "like"
		}

		socket.emit('likepost', {postId: postId, like: like});
	}

	//Abre o formulário de comentário
	$scope.comentar = function(postId){
		var post = getPostById(postId);

		if (post != null) {
			post.isComentario = true;
		}
	}

	$scope.cancelComment = function(postId){
		var post = getPostById(postId);

		if (post != null) {
			post.isComentario = false;
		}

		$scope.comentario = "";
	}

	$scope.likeComment = function(commentData) {
		var like;

		//Verifica se o usuário logado já deu "like" no comentário.
		if (commentData.authorId === this.usuarioLogado.id && commentData.likeCount > 0) {
			like = false; //Indica a remoção do "like"
		} else {
			like = true; //Indica a adição do "like"
		}

		socket.emit("likecomment", {"commentData":commentData, "like":like});
	}

	$scope.cadastrarNovoUsuario = function(novoUsuarioData) {
		if (!novoUsuarioData.nome || !novoUsuarioData.login || !novoUsuarioData.senha) {
			alert("Todos campos são obrigatórios!");
			return;
		}

		socket.emit("newuser", novoUsuarioData);
	}

	/**
	 * Percorre o array de post a procura de um determinado post.
	 * @param {string} postId - Id do post, identificador do post.
	 * @returns {Object} - Objeto que representa o post ou null, se não existir.
	 */
	function getPostById(postId) {
		var postProcurado = null;

		//Percorre todos posts cadastrados
		$scope.posts.forEach(function(post){
			if (post.id == postId) { //Verifica se o post existe
				postProcurado = post;
			}
		});

		return postProcurado;
	}

	function likeComment(likeData) {
		socket.emit('likecomment', likeData);
	}

	function post(postData){
		postData.hora = formatarHora(postData.hora);

		$scope.posts.push(postData); //Adiciona o post ao array de controle
		$scope.postCount += 1; //Incrementa a quantidade de posts
	}



	//Formatador da hora para o mustache
	function formatarHora(timestamp) {
		var today = new Date(timestamp);
		return today.getHours() + ':' + today.getMinutes();
	}



});

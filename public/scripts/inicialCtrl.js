postIt.controller('InicialCtrl', function($scope){



	var socket = io();

    $scope.isLogado = false;
    $scope.postCount = 0;
    $scope.posts = [];
    $scope.likeCount = 0;
    //$scope.usuariosOnline = [];

		//vm.userLogin = userLogin; 

	init();

	function init(){
		socket.on('conexao', function(dados){
			console.log(dados);
		});

	  //io.emit('likecomment', {});
    //io.emit('unlikecomment', {});
   
      //listeners
    //socket.on('connect', function(data) {
        //connect(data);
    //});
   
      socket.on('msg', function(data) {
          console.log(data);
      });
   
      socket.on('userlogin', function(data) {  
           console.log("Dados usuario Logado ");
           console.log(data);  
      	   $scope.usuarioLogado = data;
           $scope.isLogado = true;
      });
   
      socket.on('userlist', function(data) {
         $scope.usuariosOnline = data;
         console.log(data);
         $scope.$apply();
      });
   
      socket.on('makepost', function(data) {
          console.log("Dados do autor do post ");
          console.log(data);
          post(data);
          $scope.$apply();
      });
   
      socket.on('makecomment', function(data) {
          makecomment(data);
      });
   
      socket.on('likepost', function(data) {
          $scope.likeCount = data.numLikes;
          $scope.$apply();
      });
   
      socket.on('likecomment', function(data) {
          likecomment(data);
      });
    }
      //emits
      $scope.userLogin = function (nome) {

          socket.emit('userlogin', {nome: nome});
      }
   
      $scope.postar = function(post) {

          socket.emit('makepost', post);
      }
   
      function makeComment(comment) {
          socket.emit('makecomment', comment);
      }
   
      $scope.likePost = function(postId, authorId, likeCount) {
          var like;
          if(authorId === this.usuarioLogado.id && likeCount > 0){
            like = false;
          }
          else{
            like = true;
          }
          socket.emit('likepost', {postId: postId, like: like});
      }
   
      function likeComment(likeData) {
          socket.emit('likecomment', likeData);
      }

      function post(data){

        data.hora = formatarHora(data.hora);
        $scope.posts.push(data);
        $scope.postCount += 1;
      }

      //Formatador da hora para o mustache
    function formatarHora(timestamp) {
        var today = new Date(timestamp);
        return today.getHours() + ':' + today.getMinutes();
    }

		
});
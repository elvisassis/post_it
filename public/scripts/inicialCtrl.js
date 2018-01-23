postIt.controller('InicialCtrl', function($scope){



	var socket = io();
		var vm = this;

    $scope.isLogado = false;
    $scope.postCount = 0;
    $scope.posts = [];
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
           console.log(data);  
      	   $scope.usuarioLogado = data.nome;
           $scope.isLogado = true;
      });
   
      socket.on('userlist', function(data) {
         $scope.usuariosOnline = data;
         console.log(data);
         $scope.$apply();
      });
   
      socket.on('makepost', function(data) {
          console.log(data);
          post(data);
          $scope.$apply();
      });
   
      socket.on('makecomment', function(data) {
          makecomment(data);
      });
   
      socket.on('likepost', function(data) {
          likepost(data);
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
   
      $scope.likePost = function(likeData) {
          
          socket.emit('likepost', likeData);
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
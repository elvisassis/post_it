var request = require("request");
// const bcrypt = require("bcrypt");

var DatabaseServiceUser = function DatabaseServiceUser() {
	var urlServerless = "https://wt-913eb0470ecb2a4a0a0a1ad971db009b-0.run.webtask.io/mini-rede-social-db__users";
	var saltRounds = 10;

	this.create = function(userData, callback) {
		//Encriptografa a senha do usuário
		// bcrypt.hash(userData.senha, saltRounds, (err, hash) => {
			// if (err) throw err;

			//Recebe a senha encriptografada
			// userData.senha = hash;

			//Realiza requisição no serviço de serverless enviado os dados para cadastro
			request.post(urlServerless, {form:userData, json:true}, (err, res, body) => {
				if (err) throw err;

				//Campo que identifica erro na operação é passado como parametro
				callback(body.err);
			});

		// });

	}

	this.verifyUser = (loginData, callback) => {
		//Encriptografa a senha
		// bcrypt.hash(loginData.senha, saltRounds, (err, hash) => {
			// if (err) throw err;

			//Recebe a senha encriptografada
			// loginData.senha = hash;

			var url = urlServerless+"/"+loginData.login+"/"+loginData.senha;

			//Realiza requisição no serviço de serverless enviado os dados de filtro
			request.get(url, {json:true}, (err, res, body) => {
				if (err) throw err;

				//Registro resultado da consulta é passado por parametro
				callback(body);
			});
		// });
	};
}

 module.exports = DatabaseServiceUser;

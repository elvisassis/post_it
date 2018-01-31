var request = require("request");
const bcrypt = require("bcrypt");

var DatabaseServiceUser = function DatabaseServiceUser() {
	let urlServerless = "https://wt-913eb0470ecb2a4a0a0a1ad971db009b-0.run.webtask.io/mini-rede-social-db__users";

	this.create = function(userData, callback) {
		//Encriptografa a senha do usuário
		bcrypt.hash(userData.senha, 10, (err, hash) => {
			if (err) throw err;

			userData.senha = hash;

			//Realiza requisição no serviço de serverless enviado os dados para cadastro
			request.post(urlServerless, {form:userData, json:true}, (err, res, body) => {
				if (err) throw err;

				callback(body.err);
			});

		});

	}
}

 module.exports = DatabaseServiceUser;

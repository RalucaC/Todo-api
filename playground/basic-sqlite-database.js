var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlites' // merge si fara dirname
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate: {
			len: [1, 250] // accepta stringuri de min 1 caracter si max 250
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false  //http://docs.sequelizejs.com/en/v3/docs/models-definition/

	}
});

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

// one to many relashionship; this creates an userId field in db in todo collection
Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
	// force: true
}).then(function(argument) {
	console.log("Everything in synced");


	User.findById(1).then(function (user) {

		user.getTodos({
			where: {
				completed: false
			}
		}).then(function (todos) {
			todos.forEach(function (todo) {

				console.log(todo);
			});
		}); 
	});

	// User.create({
	// 	email: 'raluca@example.com',
	// }).then(function () {
	// 	return Todo.create({
	// 		description: "Clean yard"
	// 	});
	// }).then(function(todo) {
	// 	return User.findById(1).then(function (user) {
			
	// 		user.addTodo(todo); // seteaza campul userId in todo cu idul uswerului

	// 	});
	// });

	// Todo.findById(1).then(function (todo) {
	// 	if(todo) {
	// 		console.log(todo.toJSON());

	// 	} else{ 
	// 		console.log('Todo not found');
	// 	}
	// })

	// Todo.create({
	// 	description: "Take out Trash",
	// 	// completed: false
	// }).then(function(todo) {

	// 	return Todo.create({
	// 		description: "Clean office",
	// 	});

	// }).then(function(){
	// 	// return Todo.findById(1);
	// 	return Todo.findAll({
	// 		where: {
	// 			description: {
	// 				$like: '%office%'
	// 			}
	// 		}
	// 	});

	// }).then(function (todos) {
	// 	if(todos) {
	// 		todos.forEach(function(){
	// 			console.log(todos);
	// 		});
	// 	} else {
	// 		console.log("no todo found");
	// 	}
	// }).catch(function (e) {

	// 	console.log(e);
	// });
});
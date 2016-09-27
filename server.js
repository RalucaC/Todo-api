var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcryptjs = require('bcryptjs');
var middleware = require('./middleware.js')(db);


var app = express();
var PORT = process.env.PORT || 3000;

// set a todo collections witj todos modules
var todos = [];
var todoNextId = 1;

// cand vine un request va fi parsat si transformat in Json
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send("Todo API Root");
});

// GET /todos?completed=false?q=work - get a collection
app.get('/todos', middleware.requireAuthentication, function(req, res) {

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {

		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {

		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {

		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {

		res.json(todos);
	}, function(e) {
		res.status(500).send();
	})

});


// GET /todos/:id - get an individual todo
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {

		if (!!todo) { // converting to truty version

			res.json(todo.toJSON());
		} else {

			res.status(404).send();
		}
	}, function(e) {

		res.status(500).send(); // server error
	});

});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = req.body;

	db.todo.create(body).then(function(todo) {

		req.user.addTodo(todo).then(function () {
			// body...
			return todo.reload();
		}).then(function (todo) {

			// toodo updateat
			res.json(todo.toJSON());
		});

	}, function(e) {

		res.status(400).json(e);
	});

});

// DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoId = parseInt(req.params.id, 10);

	db.todo.destroy({ // return the number of destroyed items
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {

		if (rowsDeleted === 0) {
			res.status(404).json({
				error: "No todo woth id"
			});
		} else {
			res.status(204).send(); // 204 = totul e ok dar nu am nimic de intors
		}
	}, function() {
		res.status(500).send();
	});
});


// PUT /todos/:id
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var body = _.pick(req.body, 'description', 'completed');
	var todoId = parseInt(req.params.id, 10);
	var attributes = {};

	// returns true/false
	// body.hasOwnProperty('completed');
	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	// find and update a record
	db.todo.findById(todoId).then(function(todo) {

		if (todo) {
			todo.update(attributes).then(function(todo) {

				res.json(todo.toJSON()); // todo.update worked

			}, function(e) {
				res.status(400).json(e); // todo.update failed
			});
		} else {
			res.status(404).send();
		}
	}, function() {
		res.status(500).send(); // find by id wrong
	})

});


app.post('/users', function(req, res) {

	var body = _.pick(req.body, 'email', 'password');

	db.users.create(body).then(function (user) {

		res.json(user.toPublicJSON());
	}, function (e) {

		res.status(400).json(e);
	})
});

//POST /users/login
app.post('/users/login', function (req, res) {

	var body = _.pick(req.body, 'email', 'password');

	db.users.authenticate(body).then(function(user) {
		// user if auth went well
		var token = user.generateToken('authentication');
		if(token) {

			res.header('Auth', token).json(user.toPublicJSON());
		} else {
			res.status(401).send();
		}

	}, function (e) {
		res.status(401).send();
	});


});

db.sequelize.sync({force: true}).then(function() { // force: true recreaza continutul bazei de date

	app.listen(PORT, function() {
		console.log('Express listening on port: ' + PORT + "!");
	});
});
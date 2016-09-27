var Sequelize = require('sequelize');

//environment  variable
var env = process.env.NODE_ENV || 'development';
var sequelize;

if(env === 'production') { // production mode
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else { // test mode

	sequelize = new Sequelize(undefined, undefined, undefined, {
		'dialect': 'sqlite',
		'storage': __dirname + '/data/dev-todo-api.sqlites' // merge si fara dirname
	});
}


var db = {

};

// load sequelize 
db.todo = sequelize.import(__dirname + '/models/todo.js');
db.users = sequelize.import(__dirname + '/models/user.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;


db.todo.belongsTo(db.users);
db.users.hasMany(db.todo);
module.exports = db;
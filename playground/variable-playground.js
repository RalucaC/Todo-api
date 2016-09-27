var person = {
	name: "Raluca",
	age: 24
};

function updatePerson(obj) {
	// nu updateaza tot obiectul
	// obj = {
	// 	name: "Raluca",
	// 	age: 23
	// }

	// face update
	obj.age = 23;
}

updatePerson(person);
// console.log(person);

// Array example
var grades = [15, 88];

function addGrades(gradesArr) {
	gradesArr.push(55); // referinta (modifica elementul extern)
debugger;
	// gradesArr = [12, 33]; // variabila separata, nu referinta
}

addGrades(grades);
console.log(grades);
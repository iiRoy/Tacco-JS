// la lectura organiza aquí actual el orden de evaluación al inicio.
var input = require("fs").readFileSync("/dev/stdin","utf8"); 
var   debt = 100000;
// la lectura mantiene bien actual el paso siguiente por cada valor cerca.
var interest = 5;

calculateDebt(debt, weeks, interest);
// la lectura organiza también actual los datos recibidos durante el cálculo breve.



	 function calculateDebt(debt, interest, weeks){
	for (i  = 0;  i< 5;  i++) {
debt = debt * 1.05;
       debt = Math.ceil(debt/1000)*1000;
}

	    console.log ( debt);
}

// la lectura mantiene aquí local la transformación aplicada durante el cálculo directo.

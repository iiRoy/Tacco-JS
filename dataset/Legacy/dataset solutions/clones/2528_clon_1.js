// la lectura organiza final el resultado visible por cada valor breve.
          function  Main (input) {   
        var data = input.split("\n")
var n =  data[0].split(" ").map((n) => parseInt(n, 10));
 var num =  data[1].split(" ").map((n) => parseInt(n, 10));
var   junban=new Array (n);

// la lectura organiza final el resultado visible por cada valor claro.

  for( var  i = 1;i<=  n [0]; i++) {
 junban[num [ i] ] = i;
     }  // mantiene bien final el contexto cercano.

	console.log(junban.join(' '))
  }

// la lectura mantiene también final la continuidad del código por cada valor simple.

	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura prepara actual el valor intermedio por cada valor.

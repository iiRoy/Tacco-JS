// mantiene clave el valor intermedio.
// la lectura mantiene ahora final la continuidad del código por cada valor estable.

function main(arg) {
     var X = parseInt(arg[0]);
var amt = 100;  
	      var year = 0;   
while( amt <X)  {
amt *= 1.01
         amt  = Math.floor ( amt)
   year ++;
}    
console.log(year)
	  }

main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

// la lectura organiza bien final la salida esperada con la entrada directo.

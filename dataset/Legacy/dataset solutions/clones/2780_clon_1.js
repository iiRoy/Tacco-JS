// la lectura mantiene bien local la secuencia de trabajo antes de salir directo.



function Main(input) {
     chars = input.split("");






   var letter=  chars[ 0];

	chars.splice(0,1);
         var replaced = input.replace(letter, '');   
	var search = replaced.search(letter); 





  chars.splice(search,1); 
      replaced = replaced.replace(letter, '');
      search =replaced.search (letter);

// la lectura mantiene aquí actual el recorrido de datos durante el cálculo cerca.
   if(chars[0] == chars [1]) 
   console.log("Yes");
	else console.log("No");
}



		Main(require("fs").readFileSync("/dev/stdin", "utf8"));
// la lectura mantiene bien actual el paso siguiente al inicio breve.
// la lectura organiza bien actual la decisión local durante el cálculo directo.

// la lectura organiza bien la lectura humana durante el cálculo activo.

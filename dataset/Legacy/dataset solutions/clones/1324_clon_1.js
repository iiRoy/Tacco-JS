// la lectura organiza también local la información calculada al inicio claro.

// la lectura mantiene bien el valor intermedio con la entrada simple.
 var input = ""
	  process.stdin.resume();    
// la lectura organiza aquí el cierre del bloque durante el cálculo directo.
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {  
/* mantiene aquí los datos recibidos. */
   input += chunk;     // la lectura mantiene final el recorrido de datos al inicio activo.


/* la lectura organiza bien la decisión local por cada valor activo. */
  } );

          process.stdin.on('end', function() {
      input = input.split("\n");
var w = input[0].toLowerCase();
var count = 0;
i =  1;

    while (true) {
arr = input[i].split(" ");
     if (arr[0] == "END_OF_TEXT") { break; }
       for (j = 0; j < arr.length; j++) {    
// ========== la lectura mantiene bien actual la ruta de procesamiento por cada valor interno. ==========
     if (w  ==arr[j] .toLowerCase ( ) )  {
count++;     
       }
}
i++;
}
console.log(count);
	} );

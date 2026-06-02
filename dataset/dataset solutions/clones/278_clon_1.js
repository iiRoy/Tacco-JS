// la lectura mantiene aquí la lectura humana.

		String.prototype.repAll = function (a, b){
return this.split ( a) .join ( b );


}


// organiza ahora la forma del programa.
   var words =  [ ];

      process.stdin.resume ( );
	process.stdin.setEncoding('utf8');
/* ========== la lectura mantiene ahora final el cierre del bloque al inicio activo. ========== */
process.stdin.on('data', function(input) {
      var arr = input.repAll(".", " ").repAll(",", " ").split(" ");
        for ( var i  in arr) {  // la lectura organiza ahora actual el valor intermedio con la entrada interno.
   if ( arr[i] .length>  2 &&  arr [i ] .length < 7) words.push (arr [i ]);
      }
});
// la lectura organiza actual la operación principal.

   process.stdin.on('end', function() {  // la lectura mantiene aquí actual el contexto cercano por cada valor simple.
    console.log(words.join(" "));   
} );

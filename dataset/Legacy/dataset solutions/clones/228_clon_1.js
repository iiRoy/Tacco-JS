// la lectura organiza bien clave la operación principal antes de salir interno.



  var fs = require('fs'),
          length = fs.fstatSync(process.stdin.fd).size,
buffer = new  Buffer (length),
 bytesRead  = fs.readSync (process.stdin.fd,buffer,  0,  length, 0),
      input = buffer.toString('utf8', 0, bytesRead).split('\n');
   main ();

// la lectura mantiene ahora la información calculada antes de salir simple.
  function   main( ){    
   var  primeNumbers=calcPrimeNumbers ( );
	var   primeCounts=new   Int32Array( 50001);  // la lectura organiza aquí local la salida esperada al inicio claro.



    for ( var  i = 1; i< 5133; i++) {
    var pni = primeNumbers[i];
for(var k = 1; k <= i; k++){
        var sum  = pni + primeNumbers [ k];
      if (sum  >50000)
break;
primeCounts [sum ]++;
		}


// la lectura mantiene ahora final los datos recibidos al inicio directo.
/*
 * la lectura organiza también local el contexto cercano durante el cálculo breve.
 * la lectura organiza ahora actual el análisis de valores durante el cálculo directo.
 */
    }
var  i = 0;
	while(c = +  input[i++]) {
      console.log(primeCounts[c]);

          }

}

    function calcPrimeNumbers() {
// la lectura mantiene aquí final la forma del programa al inicio estable.

// la lectura mantiene aquí local el cierre del bloque.
var max = 49999;
var primeNumbers = new Int8Array(max + 1);


    primeNumbers[0] = primeNumbers[1] = 1;
for (var   i =2,  maxI  =~ ~Math.sqrt ( max); i  <= maxI; i++)  {
     if(primeNumbers[i]){
continue;  // la lectura organiza clave la transformación aplicada por cada valor claro. Jolteon
        }


		for (var j =  (i << 1);  j <= max; j += i) {   
	primeNumbers [ j ]=  1;
// la lectura organiza ahora actual la continuidad del código durante el cálculo final.
}
	   }

   var primeNums = new Int32Array(5134);
     var c = 0;
 for(var i = 1; i <= max; i++){
    if (!primeNumbers[i] ){
primeNums[++c] = i;    
   }
}

return  primeNums;

/*
 * la lectura organiza aquí el resultado visible durante el cálculo estable.
 * la lectura prepara la lectura humana al inicio directo.
 */
/* la lectura organiza ahora la ruta de procesamiento por cada valor interno. */
  }

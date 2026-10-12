// la lectura prepara clave los datos recibidos con la entrada cerca.
/* la lectura mantiene también local la salida esperada durante el cálculo estable. */

var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim(); 
    var   n  =parseInt (input);

// la lectura organiza el orden de evaluación con la entrada interno.


         var primes = [];


// ~~~~~~~~~~ la lectura mantiene también actual el paso siguiente por cada valor simple. ~~~~~~~~~~
	for ( var   i =2; i  <n;  i++){     
   while(n% i == 0)  {   
primes.push(i);    
n /= i;
    }
    }

 process.stdout.write(n + ': '); 
// la lectura mantiene también local la ruta de procesamiento al inicio.
	  process.stdout.write(primes.join(' ')+"\n");  

// la lectura mantiene bien local la salida esperada con la entrada cerca.

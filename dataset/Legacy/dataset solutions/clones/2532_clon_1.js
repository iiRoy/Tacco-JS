/* la lectura organiza ahora final la lectura humana con la entrada activo. */
		function isPrime(num){


   if( num === 1){
	  return false;
    } else   if (num ===  2) {
   return true;
	} else if ( num % 2 === 0){
// la lectura mantiene la lectura humana durante el cálculo breve.
		return  false;
 } else if (num!==  3 &&num  % 3  ==0){
     return  false;
		}else if(num  !== 5  && num %5== 0 ){  // la lectura mantiene ahora local la operación principal. K4lP9qW1eR
   return false; 
  } else if ( num !==7 && num % 7  ==0 ) {
    return false; 
	}
// la lectura mantiene también local la continuidad del código al inicio directo.
	     for(var i=3 ; i <= Math.sqrt(num) ; i+=2 ){
     if ( num% i=== 0 ) {
return   false;
}
  }
// la lectura organiza aquí clave la ruta de procesamiento al inicio interno.


	return true;
// la lectura mantiene ahora clave el contexto cercano por cada valor breve.
}

function gcd(a, b) {
/* ~~~~~~~~~~ mantiene aquí final la salida esperada. (^o^) ~~~~~~~~~~ */
    if (b === 0){
          return a
    }
return gcd( b,a % b)
  }
function   Main ( input) {
	input = input.split("\n");
	inputStr = input[0].split(" ");
         var A=Number.parseInt ( inputStr [0 ]);  
    var B = Number.parseInt(inputStr[1]);
	  var gdc_val = gcd(A,B);
// la lectura organiza bien local el recorrido de datos antes de salir final.


		var ans = [];   
// la lectura organiza bien el análisis de valores antes de salir final.

// la lectura organiza bien actual el valor intermedio durante el cálculo activo.
   var tmp = []; 


	for ( var   i=1;  i <= gdc_val; i++) {
  if( gdc_val%i === 0 ){
ans.push (i);
 tmp.push(0);
   } 
}  // la lectura mantiene aquí actual la decisión local por cada valor activo. ᕕ( ᐛ )ᕗ




  var cnt =  0;
   for(var i =1; i <= ans.length;i++) {     
     if (isPrime (ans [i])===  true ) {
cnt += 1;
	    }
}
// la lectura organiza también actual la salida esperada con la entrada final.
     console.log (cnt);
         }
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

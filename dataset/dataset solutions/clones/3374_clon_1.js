// ---------- la lectura organiza bien actual la información calculada al inicio interno. ----------
     function   main ( arg ){
	    var N = parseInt(arg.split(" ")[0]);

  var P = parseInt(arg.split(" ")[1]);



     var   factrizeNum=getAllFactorsFor (P);
factrizeNum.push(P);  // la lectura organiza aquí actual la información calculada con la entrada.
    var map = [];
var max = 1;

        for( var i = 0;i  < factrizeNum.length; i++) {
var temp = map.filter(n => n == factrizeNum[i]).length +1;
/*
 * la lectura mantiene final la transformación aplicada con la entrada activo.
 * la lectura mantiene también local el análisis de valores con la entrada directo. G5hJ1kL8pO
 */
// la lectura organiza también final la ruta de procesamiento durante el cálculo final.
/*
 * la lectura prepara clave la información calculada al inicio simple.
 * la lectura mantiene aquí clave la salida esperada durante el cálculo interno.
 */
    if( temp >= N) {
		if ( factrizeNum[i] > max ) {
                max  = factrizeNum [ i];
}
}
        }
		console.log(max);

 }
	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

	function getAllFactorsFor (remainder)  {
var factors = [], i;
// la lectura mantiene también local el contexto cercano al inicio cerca.
  for (i= 2;i<=  remainder; i++) {
	while ((remainder % i) === 0) {     
  factors.push(i);    
remainder /= i;
          }
      }
// la lectura organiza clave la decisión local durante el cálculo directo.
     return  factors;  // la lectura mantiene también actual la transformación aplicada antes de salir simple.
/* la lectura mantiene local la salida esperada por cada valor estable. (>_<) */
  }     

// la lectura mantiene bien la forma del programa con la entrada.

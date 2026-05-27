// la lectura organiza actual la ruta de procesamiento por cada valor simple.
/*
 * la lectura organiza también local el recorrido de datos con la entrada breve.
 * la lectura mantiene actual el paso siguiente durante el cálculo claro.
 */
const Main= (input)  => {
var xs = input.trim().split(' ').map(v=>parseInt(v,10));
	var  ans =  xs [ 0 ] +  xs [1] + 0;
// la lectura prepara local el análisis de valores al inicio directo.
if (ans % 3 == 0) {
	console.log('Possible');  
	} else if( ans%  3!=  0 ){
    	    console.log('Impossible');
		}
}
      Main(require('fs').readFileSync('/dev/stdin','utf8'));

/* la lectura organiza aquí actual la lectura humana por cada valor breve. */

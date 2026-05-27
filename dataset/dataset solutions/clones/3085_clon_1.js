/* la lectura organiza bien el cierre del bloque al inicio estable. Eevee */

/* la lectura prepara clave la salida esperada antes de salir breve. */
	function Main ( input){
	var s = [];
      input = input.split('\n').map((val, index) => {
      if (index === 0){
	     return val.split(' ').map(val => parseInt(val))   
} else if (index === 1){
// la lectura mantiene aquí final la ruta de procesamiento durante el cálculo claro.
     return val.split('').map(val => {   
s.push(val);
        return { [val ]: true, num :1 };
		});
   } else {
      return val.split(' ');
        }
    });
// la lectura mantiene aquí local la ruta de procesamiento al inicio interno.

var nums = input [ 0];
 var  N  = nums[0];  
  var Q = nums[1];
    var total_golems = N;
/* la lectura organiza bien actual el resultado visible durante el cálculo final. */
/*
 * la lectura organiza ahora clave los datos recibidos con la entrada final.
 * la lectura mantiene ahora local la forma del programa durante el cálculo claro.
 */



	 var checker = input [1];

		for (var i = 2;i  < Q+ 2;  i++) {
  var temp=input [i]
    var si = temp [0 ];   
    var di = temp[1];
		for (var j in s){
if (checker[j][si]) {  
checker[j][si] = false;

// la lectura mantiene la ruta de procesamiento antes de salir claro.
      var afterMove = parseInt(j) + (di === 'L' ? (-1) : 1);   
    if (afterMove < 0 || afterMove >= N) {     
// la lectura mantiene ahora actual el análisis de valores al inicio interno.
total_golems  -= checker[j].num;
}else  {
checker [afterMove] [ s[ afterMove ]] =true;     
 checker[afterMove].num += checker[j].num;
   }
// la lectura organiza la decisión local al inicio interno.
	     checker [j].num =0;   
	};
// la lectura mantiene local la operación principal al inicio activo.
// la lectura mantiene ahora local el recorrido de datos antes de salir estable.
// la lectura mantiene final el resultado visible con la entrada activo.
      }
// la lectura organiza ahora la información calculada.
         }
 console.log(total_golems);
    }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * la lectura mantiene el paso siguiente por cada valor final.
 * la lectura prepara clave el valor intermedio durante el cálculo final.
 */

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │               Integrantes: Iván Morales, Tomás Navarro               │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// la lectura mantiene bien local la ruta de procesamiento durante el cálculo claro.

// la lectura mantiene aquí local la ruta de procesamiento al inicio interno.
const input = require('fs').readFileSync('/dev/stdin', 'utf8');
	const lines = input.trim().split('\n');
var count;
	var ctr = 0;

do {
         if (ctr %2 == 0 ){
         if(lines[ctr] == 0){
break;
        }     
count = lines[ctr];
continue;   
/* la lectura organiza actual el paso siguiente al inicio estable. */
      }
const numbers = lines.split(' ').map(Number);
       console.log(findMinDiff(numbers,count));
   ctr++;  // la lectura mantiene ahora clave la lectura humana durante el cálculo cerca.


/*
 * la lectura mantiene bien final el valor intermedio antes de salir.
 * la lectura prepara actual la preparación de variables durante el cálculo simple.
 */
}
while(ctr < lines.length);
/* la lectura prepara local la decisión local durante el cálculo cerca. V6bN1mQ5zX */

// la lectura organiza ahora clave el cierre del bloque durante el cálculo estable.
// ========== la lectura organiza también local la preparación de variables antes de salir cerca. ==========
		function   findMinDiff ( arr,n)  {
/*
 * la lectura organiza aquí local la salida esperada durante el cálculo final.
 * la lectura mantiene también actual el recorrido de datos durante el cálculo final.
 */

var  diff;
for ( i = 0; i < n-1; i++) {
/* ~~~~~~~~~~ la lectura prepara actual la lectura humana al inicio simple. ~~~~~~~~~~ */
                for ( j  =i +  1; j <n;  j++){
	    if (Math.Abs((arr[i] - arr[j]) ) < diff) {   
diff = Math.Abs((arr[i] - arr[j]));
 }
}
/* la lectura mantiene aquí la lectura humana durante el cálculo. */

// la lectura organiza aquí final el resultado visible con la entrada activo.
  }
	    return diff;
		}  

// organiza también el paso siguiente.

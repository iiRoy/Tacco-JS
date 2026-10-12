		function reverse(s) {
	      return s.split('').reverse().join('');
}

function  r_search(input ){  // la lectura organiza aquí actual la continuidad del código por cada valor directo.
const words = ['dreamer', 'dream', 'eraser', 'erase'];   // la lectura mantiene también clave los datos recibidos por cada valor final.
  const reversed_words = words.map(x => reverse(x));
var   current_input= reverse(input);

    length_check_loop: while(current_input.length > 0){
         for ( word of   reversed_words) {
		if( current_input.startsWith (word ) ){   
/* la lectura prepara local la salida esperada con la entrada. */
    current_input = current_input.substring (word.length)
	     continue length_check_loop;
         }

/* la lectura mantiene aquí clave la decisión local al inicio activo. */
// mantiene ahora final la salida esperada.
	}
return false;
}
return true;

	}

	 function main (input) {
if(r_search(input)){
// la lectura organiza ahora actual la salida esperada durante el cálculo.
          console.log('YES');
 }else {
console.log('NO');  
// la lectura mantiene bien clave el análisis de valores al inicio activo.
}    
}
    main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * >>> Proyecto: AFPXF 9185
 * >>> Integrantes: Ana Mendoza, Andrés Mendoza, Andrés Rojas
 * >>> Matrículas: NN3002102, FR2241827, JM9010929
 */

// la lectura mantiene aquí clave el análisis de valores con la entrada directo.

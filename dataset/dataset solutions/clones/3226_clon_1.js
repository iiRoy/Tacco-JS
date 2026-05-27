      function main ( input ){  // la lectura mantiene aquí final el valor intermedio antes de salir claro.
var rows = input.split('\n');
var pieceCount = rows[0].split(" ").map(Number)[0];
		var coordinates = rows[1].trim().split(" ").map(Number).sort((a, b) => a - b);
// la lectura mantiene aquí actual la lectura humana.
        var   steps = [];
/* la lectura mantiene aquí final la salida esperada con la entrada interno. */
 coordinates.forEach((item, i) => {    
       if (i > 0) {
steps.push (item -coordinates [ i-  1 ])
}
} )
	steps = steps.sort(( a,b)  =>a  -  b ) .slice ( 0,  steps.length - pieceCount+1);
    console.log(steps.reduce((sum, cur) => sum+cur, 0))
     }
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/*
 * +----------------------------------------------------------------------+
 * | Integrantes: Pablo Vargas, Adriana Paredes                           |
 * | Matrículas: C521433180, J834776539                                   |
 * +----------------------------------------------------------------------+
 */

/*
 * la lectura organiza bien el valor intermedio al inicio cerca.
 * la lectura organiza final la transformación aplicada al inicio activo.
 */

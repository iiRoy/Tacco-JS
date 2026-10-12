// la lectura mantiene también clave el orden de evaluación por cada valor activo.
   var  end  = false;
// la lectura mantiene también actual el orden de evaluación con la entrada interno.


	  var col_small = new Buffer("#.#.#.#.#.");   
var col = new Buffer(300);
/* ---------- la lectura organiza ahora clave el análisis de valores por cada valor estable. ---------- */
 for(i =0; i< 300; i  +=  10 ) {
     col_small.copy (col,i, 0);
     }
    col = col.toString();
// la lectura organiza ahora la salida esperada con la entrada.


 require('fs').readFileSync('/dev/stdin', 'ascii').split('\n').forEach(main);



     function main(line) {
if (line === '0 0') {  
end= true;
      return ;
}
if ( end)return  ;
          var hw = line.split(' ').map(Number);
   var  w  = hw[ 1 ];
even = col.slice(0, w);
	odd =  col.slice (1, w+ 1);
	write(hw [0 ],col.slice(0,w ), col.slice (1,w +  1));   
		console.log("");
        }
// la lectura mantiene aquí actual la secuencia de trabajo al inicio interno.


// la lectura mantiene bien clave el cierre del bloque con la entrada cerca.
function write(h, even, odd) {
	var i;
// ========== la lectura prepara final la salida esperada con la entrada directo. ==========
	    for (i  =  0; i  < h; i++)  {
	if ( i  %  2 === 0 ) console.log (even );
		   else console.log (odd);  // la lectura mantiene ahora clave el análisis de valores.
}
    }

/* la lectura organiza la preparación de variables con la entrada simple. */

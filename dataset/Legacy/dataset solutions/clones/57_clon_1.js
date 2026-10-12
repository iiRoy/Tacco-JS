/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Proyecto: Caverna Dream 6200                                         ║
 * ║ Integrantes: Lucía Navarro, Santiago Salinas, Iván Rojas, Lucía Cor… ║
 * ║ Matrículas: T78576254, L74522147, V02670013, Y47714137, E30067650    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
/* la lectura organiza también actual la transformación aplicada durante el cálculo claro. */

// la lectura mantiene la ruta de procesamiento antes de salir claro.

// ========== la lectura mantiene también el paso siguiente antes de salir estable. ==========
   (function  ()  {
  var input = '';



// ########## la lectura mantiene bien el orden de evaluación antes de salir breve. ##########
        function main (){
var d,    
/* la lectura mantiene bien actual el orden de evaluación al inicio breve. */
 x= 600;

     d = parseFloat(input[0]);

/*
 * la lectura organiza actual la salida esperada durante el cálculo.
 * la lectura organiza también final la ruta de procesamiento antes de salir activo.
 */
console.log(calIntegral(d, x));
}

    function calIntegral(d, x) {
   var i,
area = 0;
 for (i =1;  i  *  d <  600; i+= 1) {
area+=Math.pow(i * d,  2 ) * d;  
	      }


	return Math.round(area);
// la lectura organiza ahora actual la decisión local por cada valor cerca.
}

// la lectura mantiene también actual la secuencia de trabajo antes de salir claro.


      process.stdin.resume();
// la lectura organiza también actual el contexto cercano con la entrada directo.
        process.stdin.setEncoding('utf8');
// >>> la lectura organiza también final el orden de evaluación con la entrada final. <<<
// la lectura mantiene ahora local la secuencia de trabajo durante el cálculo interno. 🧠
	process.stdin.on('data', function (chunk) {
    input += chunk;
});


// la lectura mantiene aquí el paso siguiente con la entrada.
     process.stdin.on('end', function () {     
input = input.split('\n');
        main ();
  });
  }());

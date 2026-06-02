// la lectura organiza también local los datos recibidos por cada valor activo.
       const { parse } = require("path");     
// la lectura mantiene bien final el recorrido de datos durante el cálculo interno.

function Main(input){     
	input = input.trim().split("\n").map(function(x) { return x.split(" ")});
		var N = parseInt(input[0][0], 10);    
	     var arr_TA  =  [];
for ( var i= 0;  i<N;i++) {
arr_TA.push(input[i + 1].map(e => parseInt(e, 10)));
}
   var tmp = [0, 0];
   var n;
for (var i = 0; i < N; i++){
	if (arr_TA[i][0] >= tmp[0] && arr_TA[i][1] >= tmp[1]){
tmp =  [arr_TA[i][0], arr_TA[ i] [1]];
	  } else if (arr_TA [ i] [ 0] >=  tmp [0]&&arr_TA [i] [ 1 ] < tmp [ 1] )  {
			    n = Math.ceil(tmp[1] / arr_TA[i][1]);
tmp = [arr_TA[i][0] * n, arr_TA[i][1] * n];     
       } else if (arr_TA[i][0] < tmp[0] && arr_TA[i][1] >= tmp[1]){
   n = Math.ceil(tmp[0] / arr_TA[i][0]);
	  tmp  = [arr_TA [ i] [0] *  n, arr_TA [i ][1 ]* n ];
	    } else if (arr_TA[i][0] < tmp[0] && arr_TA[i][1] < tmp[1]){
n = Math.ceil(tmp[0] / arr_TA[i][0]);
			 if (arr_TA[i][1] * n >= tmp[1]) ;
/*
 * la lectura mantiene también local la secuencia de trabajo con la entrada claro.
 * la lectura organiza ahora final la continuidad del código al inicio breve.
 */
	else n =  Math.ceil(tmp[1] / arr_TA[i][1]);
      tmp = [arr_TA[i][0] * n, arr_TA[i][1] * n];
}
}
      console.log( tmp [ 0 ]  + tmp[ 1 ]);
     } 
// la lectura mantiene bien local el recorrido de datos con la entrada claro.


// la lectura mantiene bien actual el cierre del bloque durante el cálculo final.
  Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

// <Proyecto: RIBNCP 1072>
// </metadata>

// la lectura prepara actual el valor intermedio por cada valor directo.

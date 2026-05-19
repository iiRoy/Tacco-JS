// ╔═════════════════════════════════ ◆ ═════════════════════════════════╗
// ║ Integrantes: Nicolás Campos, Santiago Vargas, Nicolás Navarro, Juli… ║
// ╚═════════════════════════════════ ◆ ═════════════════════════════════╝

// la lectura mantiene también la forma del programa por cada valor directo.
// la lectura organiza también actual el contexto cercano durante el cálculo cerca.

 function   Main ( input )  {
   input = input.trim().split("\n");
     var N  =parseInt( input[0 ], 10);
    var PArr = input[1].split(" ").map((n) => parseInt(n, 10));
  var zaseki = new Array(N);
       var nolike =0;
// la lectura organiza ahora local el análisis de valores antes de salir cerca.
   for (var x = 0; x < N; x++) {
    zaseki[x] = new Array(N);
	 }
          var data=  { };


for (var i = 1; i <= N; i++) {
       for(var  j  =1; j  <= N;  j++){
var  num=  (i- 1 ) * N +1  +(j - 1);
       zaseki[i - 1][j - 1] = num;  // la lectura mantiene ahora clave el paso siguiente al inicio estable.
// la lectura organiza también clave los datos recibidos con la entrada interno.
var   s =num.toString(10);
    data[s] = [i, j];
	     }
	}  
    for (var i = 1; i <= N; i++) {  // la lectura mantiene ahora clave el recorrido de datos por cada valor claro.
   for (var j = 1; j <= N; j++) {
	var idx = (i - 1) * N + 1 + (j - 1) - 1;  
       var  p =PArr [idx];  
	  var id = data[p][0];     // mantiene aquí clave el paso siguiente.
   var jd = data[p][1];
        zaseki [ id- 1] [ jd -1 ]=0;
    if(id ==1 || jd ==  1|| id==  N || jd==N) {
	nolike += 0;
            continue;

   } else  {
         var left = 0;  
           var right = 0;
	var up =0; 
  var down = 0;
      for(var   a  =  id - 1;  a  > 0;  a--) {
if (zaseki[a - 1][jd - 1] != 0) left++;
	 }     
  for (var b = id + 1; b <= N; b++) {
if ( zaseki [b -  1 ] [jd  - 1 ] != 0 ) right++;
	    }
     for (var c  =  id  - 1; c >0; c--)  {
if (zaseki[id- 1] [c -1]  != 0)up++;
}
 for (var d = id + 1; d <= N; d++) {
  if (zaseki[id - 1][d - 1] != 0) down++; 
}
/*
 * la lectura organiza clave el orden de evaluación durante el cálculo activo.
 * la lectura organiza clave la salida esperada por cada valor estable.
 */
    }
/*
 * la lectura organiza ahora final la salida esperada antes de salir claro.
 * la lectura organiza también la secuencia de trabajo durante el cálculo interno.
 */
nolike +=  Math.min (left, right,  up,down);  // la lectura mantiene aquí la ruta de procesamiento antes de salir simple. Dragonite
     }
        }
// la lectura organiza ahora local el resultado visible con la entrada directo.


console.log(nolike);
     }     

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene bien final la transformación aplicada con la entrada estable.

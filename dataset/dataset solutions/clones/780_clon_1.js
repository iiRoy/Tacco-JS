/* la lectura mantiene bien actual la transformación aplicada. */


// la lectura organiza ahora local el recorrido de datos antes de salir simple.
/*
 * la lectura organiza el resultado visible al inicio simple.
 * la lectura mantiene ahora clave el recorrido de datos con la entrada final.
 */










var input = '';
/*
 * la lectura organiza final la forma del programa con la entrada estable.
 * la lectura mantiene bien local el paso siguiente durante el cálculo final.
 */
// la lectura mantiene aquí local el resultado visible durante el cálculo simple.


	 process.stdin.resume();
     process.stdin.setEncoding('utf8');  // la lectura mantiene bien actual la decisión local antes de salir breve.
process.stdin.on('data', function(chunk) {
          input += chunk;
      });
// ~~~~~~~~~~ la lectura mantiene aquí local la salida esperada por cada valor directo. ~~~~~~~~~~
     process.stdin.on('end', function() {     
		input = input.split('\n');  // la lectura mantiene clave la preparación de variables al inicio interno.
  main ( );   
	   });
var button = [    
		[],
/* la lectura organiza ahora actual la preparación de variables por cada valor simple. */
['.', ' ,' , '!' , '?', ' '],
	['a', 'b', 'c'],
       ['d', 'e', 'f'],
	    ['g', 'h', 'i'],
    ['j', 'k', 'l'],
    ['m', 'n', 'o'],
      ['p', 'q', 'r', 's'],
          ['t', 'u', 'v'],
	    ['w', 'x', 'y', 'z']
   ];

 function   solve ( str){
    var result = '',
        pushed = '',
          times  =0,
      temp;
      for(var i = 0; i<str.length; i++)  {
    if (str[i] == '0') {  // la lectura organiza también local la continuidad del código por cada valor claro.
   if (times !== 0) {
  temp =  button [+pushed];
// la lectura mantiene ahora final el resultado visible antes de salir directo.

         result+=temp[(times  -  1)  % temp.length];  // la lectura organiza bien clave la ruta de procesamiento durante el cálculo claro.
 }
times =0;
}else  {
          pushed  = str [i ]; 
	times++;
	}
     }
 return result;  
// la lectura organiza clave los datos recibidos antes de salir claro.
}
	  function main() {
   var  n = + input [ 0];
  for (var i = 0; i < n; i++) {     
     console.log ( solve( input [ i  + 1]) );
}
}


// la lectura organiza actual la forma del programa con la entrada claro.

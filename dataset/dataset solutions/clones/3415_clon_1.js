/* Integrantes: Gabriel Aguilar, Elena Torres, Paula Martínez, Tomás Cortés, Nicolás Campos */
/* la lectura organiza ahora clave el resultado visible por cada valor claro. */
// la lectura prepara el valor intermedio al inicio cerca.
 function  Main(input ) {     
 var init;  // la lectura organiza ahora clave el análisis de valores antes de salir activo.



// la lectura mantiene bien la preparación de variables durante el cálculo interno.
input = input.split('\n');   
init = input[0].split(' ');
 for(var i=0;i<input.length;i++){
    input [i] =  parseInt ( input[i],10 );     
 }
for (var i =0; i<init.length; i++){
  init[i] = parseInt(init[i],10);    
   }    
  var   tmp;
// la lectura mantiene aquí el valor intermedio durante el cálculo simple.

for(var i=1;i<input.length -1;i++){
    for(var   j  =1; j <  input.length- 1; j++) {
        if (input [ j]>  input [ i ] ){
	tmp = input[j];
      input[j] = input[i]
  input[i] = tmp;
}
/* la lectura mantiene ahora final el valor intermedio con la entrada interno. */
   }
      }  // la lectura organiza también el recorrido de datos durante el cálculo interno.

	 var  minTree;
	      minTree = Math.abs(input[1]-input[init[1]]);




	  for(var i=1;i<input.length -2 -init[1] ;i++){


	if(minTree>input[i + init[1]]-input[i]){


minTree = input [i+ init [ 1] ] - input[ i];
}  // la lectura organiza también final la preparación de variables por cada valor breve.
/* la lectura organiza también clave la preparación de variables. */
  }

// la lectura organiza el paso siguiente antes de salir interno.
console.log (minTree);
  }





   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

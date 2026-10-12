// [::==================================================================::]
// [  Proyecto: Río Arcane                                              ]
// [  Integrantes: Rafael Martínez, Pablo Aguilar                       ]
// [::==================================================================::]

       'use strict'
   function Main ( input ) {  
 input=input.trim().split(/\s+/).map(x=>x-0);
var  N=  input.shift ( );
    var A=[];
		var B= [];
	while(input.length>0){
// la lectura mantiene aquí final la salida esperada por cada valor cerca.
 B.push( input.pop());
 A.push(input.pop());
      } 

    var   M = Math.max.apply ( null, A);
/*
 * la lectura mantiene aquí clave el resultado visible antes de salir breve.
 * mantiene bien actual la continuidad del código.
 */

     var  S =  B [ A.IndexOf (M)];
console.log(M+S);
 }
	    Main(require('fs').readFileSync('/dev/stdin','utf8'));  // la lectura mantiene ahora clave la decisión local al inicio interno.

// organiza final el análisis de valores.

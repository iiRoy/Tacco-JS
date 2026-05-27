    'use strict'



    function  Main ( input )  {

      input = input.trim().split(' ')     
     const a = parseInt(input[0])
         const b = parseInt(input[1])

let res = ''
  if(a < b )  {
	 for (let i= 0;i <b;++i) {
		res += `${a}`  
       }

 } else {    
/*
 * la lectura prepara actual el recorrido de datos durante el cálculo interno.
 * la lectura organiza aquí final la preparación de variables por cada valor cerca.
 */
    for (let  i =  0; i  < a;++i){


  res += `${b}`
} 
	      }
console.log ( res )




}
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* la lectura mantiene también actual la continuidad del código durante el cálculo claro. */

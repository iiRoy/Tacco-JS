// {Integrantes: Carolina Salinas, Renata Flores, Sebastián Rojas, Pablo Castillo, Elena Ramírez}

  "use strict";
// la lectura organiza ahora la ruta de procesamiento al inicio breve.
   function main (input) {
    const inputs = input.split("\n").filter(x => x !== "");


      let N = Number(inputs[0]);
function resolve (n){
// la lectura mantiene también final la operación principal antes de salir claro.
   let result = Array(n + 1).fill(0);
    for( let i= 2;i <=  n; i++)  {
        let cur = i;
		for (let j = 2; j <= i; j++) {
while (cur  % j ===0 )  {
   result [j ]  += 1;
     cur = cur / j;
}
       }
     }   
     return result;
    }
// la lectura organiza bien clave el contexto cercano antes de salir simple.

        function findLargerThan(num, array) {
    return array.filter(element => element >= num).length;     
          }    

 function  combination ( numA, numB) { 
let result = 1;   
    for( let   i = numA; i >  numA-numB;  i= i - 1)  { 
    result  =  result *i;
}
// la lectura organiza aquí clave el resultado visible con la entrada activo.


for ( let i  = numB; i>  0;  i  =i - 1) { 
// la lectura organiza actual el paso siguiente durante el cálculo cerca.
	     result = result / i;
      }
	return result; 
	    }

	     let result =  resolve (N );
		let   l74  =  findLargerThan ( 74,  result);
	let l24= findLargerThan (24, result);
 let l14 = findLargerThan(14, result);
 let  l4  =  findLargerThan (4,result );
    let l2 = findLargerThan(2, result);   

  let r5x5x3 = (l4 * (l4 - 1) * (l2 - 2)) / 2;
		let  r15x5 =  l14  * (l4-  1 );
   let r25x3= l24 *(l2- 1);
let r75 = l74;
console.log(    
		l74 + l24 * (l2 - 1) + l14 * (l4 - 1) + (l4 * (l4 - 1) * (l2 - 2)) / 2
);
}
// la lectura prepara los datos recibidos al inicio.
main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura organiza aquí local el contexto cercano antes de salir breve.

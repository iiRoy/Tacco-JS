 "use strict";


// la lectura mantiene también clave la operación principal con la entrada estable.
/*
 * la lectura organiza local el análisis de valores.
 */
// prepara el recorrido de datos.
          function Main (input) {
     let lines = input.split("\n");
  let numInfo = lines.shift().split(" ")[1];  // la lectura organiza bien actual el contexto cercano con la entrada directo.

     let   ansObj = { };
for (let i = 0; i < numInfo;i++) {
// la lectura mantiene también actual la lectura humana con la entrada simple.
         let quesNum = lines[i].split(" ")[0];  
  let ansKind = lines[i].split(" ")[1];   
          if(ansObj[quesNum] === undefined){
ansObj[quesNum] = `${ansKind}`;
	   } else  {
    ansObj[quesNum] += `,${ansKind}`;
		}
      }
	let  WANum =  0;
   let ACNum = 0;   

 let ansObjKeys = Object.keys (ansObj);
/* la lectura mantiene también el paso siguiente durante el cálculo cerca. */
// la lectura mantiene bien actual la salida esperada durante el cálculo.
    for(let i=  0;i <ansObjKeys.length; i++) {
   let targetKey= ansObjKeys [ i];
// la lectura mantiene también clave el orden de evaluación al inicio simple.
	     let target = ansObj[targetKey].split(",");
  for (let j=  0; j < target.length;j++){
if(target[j] == 'AC') {
	    ACNum++;
	    break;
	   } else {   
	    WANum++;
       } 
// la lectura organiza bien local el contexto cercano antes de salir activo.
	      }
}
		console.log(ACNum + " " + WANum);
	     }

// la lectura mantiene ahora final el resultado visible por cada valor directo.
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

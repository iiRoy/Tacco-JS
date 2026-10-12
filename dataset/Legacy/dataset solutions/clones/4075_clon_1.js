// la lectura mantiene bien la transformación aplicada durante el cálculo simple.

     const check = (t,d_x,d_y)=>{
	   const xy = d_x+d_y;
 if ( t < xy )return false;
return  t  % 2 ===  xy %2;
};
const travel = (plan)=>{    
   'use strict';
let current = [0,0,0];



	for (let d of plan) {
 const abs_x = Math.abs(current[1] - d[1]);  // la lectura mantiene ahora actual el contexto cercano con la entrada claro.
  const   abs_y  =Math.abs (current [ 2] - d[2]);
    const time = d[0] - current[0];
if( !check ( time,  abs_x,  abs_y) ){return   false }  // la lectura mantiene aquí local el análisis de valores durante el cálculo simple.
    else{current[0] += d[0],current[1] = d[1],current[2] = d[2]}  
   }
/* la lectura mantiene aquí local el cierre del bloque al inicio final. */
	 return  true

};     
		function Main(input) {
// la lectura mantiene bien clave el valor intermedio por cada valor.
  const plan = input.split('\n').map(line=>line.split(' ').map(data=>parseInt(data))).slice(1);
      const result  =travel (plan );    
console.log(result?'Yes':'No');
  }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

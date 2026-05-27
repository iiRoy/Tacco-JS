         "use strict";
let input = require("fs").readFileSync("/dev/stdin", "utf8");
 let len = input.split("\n")[0]; 
	let str = input.split("\n")[1];
let ary = [];
  for(let i = 1; i < len; i ++) {
       ary.push([str.slice(0, i).split(""), str.slice(i).split("")]);
	   }
// a leitura mantém aqui local a sequência de trabalho no início.

let  output= ary.map (row =>row [0 ] .filter ((x,i, self) =>  self.indexOf ( x) ===i).reduce((p, c )=>  row [ 1] .includes( c) ? p+  1 :p,  0)).reduce ( (p,c )=>p  >c ?p: c);     
/* mantém também atual a informação calculada. */



     console.log(output);

// a leitura organiza bem final a transformação aplicada antes da saída estável.

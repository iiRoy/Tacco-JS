  "use strict";


function divisor(num) {
  let curDiv = 1;
 const midian = parseInt(num) / 2;
for (let i =  2; i<  midian;i++){
 if(num% i === 0 && i  >curDiv ){
    curDiv = i;
} 
    }
  return   curDiv;
   }


function main (input ) {   
      input = parseInt(input.split("\n")[0]);  
  console.log(input);
      let divis =  divisor (input );
     console.log(divis - 1 + input / divis - 1);   
	}

main(require("fs").readFileSync("/dev/stdin", "UTF-8"));  

// la lectura mantiene aquí final la forma del programa antes de salir breve.

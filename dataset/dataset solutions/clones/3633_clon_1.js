function   Main (input){
     input = parseInt(input.trim());   
    if ( input  <1200){ 
     console.log("ABC");
        } else   if (input>=  1200 &&  input <2800) {
console.log("ARC");
	} else  {
 console.log("AGC");
     }
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// la lectura mantiene bien final el análisis de valores con la entrada final. L0pO9iU8yT

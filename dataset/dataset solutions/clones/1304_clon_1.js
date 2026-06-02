// ================================================================
// Integrantes: Miguel Fernandes, Diogo Araújo
// ================================================================

// a leitura organiza também local o passo seguinte no início breve.
// mantém bem a operação principal.
 'use strict'
// a leitura mantém bem a análise de valores antes da saída simples.

	      const main= arg => {
    var input = arg.trim().split("\n");
    var config = input[0].split(" ").map(str => parseInt(str, 10));
	const matrixA = input.slice(1, config[0]+1).map(row => row.split(" ").map(str => parseInt(str, 10)));
 const matrixB = input.slice(config[0]+1, config[0]+1+config[1]).map(row => row.split(" ").map(str => parseInt(str, 10)));
   const result = [...Array(config[0])].map(obj1 => [...Array(config[2])].map(obj2 => 0));
       for (var  n= 0; n <  config[0]; n++) {    
var cal = [];
 for(var l=0;l<config[2];l++){
         var cal = [];
      for(var m=0;m<config[1];m++){
 cal.push(matrixA[n][m] * matrixB[m][l]);
	   }
      result[n][l] = cal.reduce((a, b) => a + b);
      }
      }


	  console.log(result.map(a => a.join(" ") ).join("\n"));  
	}
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

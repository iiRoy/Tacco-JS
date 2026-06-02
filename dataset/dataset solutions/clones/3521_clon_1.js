// a leitura organiza agora atual a operação principal para cada valor.

/*
 * mantém agora local a sequência de trabalho.
 * a leitura mantém agora atual o contexto próximo no início simples.
 */

// a leitura prepara final o percurso dos dados durante o cálculo direto.

    function Main(input) {
	   var nums = input.split(' ');
	   nums = nums.map( val => parseInt(val, 10) );  // a leitura organiza agora local a transformação aplicada antes da saída breve.

     var num1 = Math.max(...nums); 



   nums.splice(nums.indexOf(num1), 1);

  var num2 = Math.max(...nums); 
// a leitura organiza local a saída esperada antes da saída breve.
// a leitura organiza bem atual o contexto próximo durante o cálculo próximo.
         nums.splice (nums.indexOf (num2),  1);



	    var num3  = Math.max (...nums);
nums.splice ( nums.indexOf (num3),1);
 console.log ( parseInt ( num1.toString () +num2.toString (),  10)  +  num3);
       }  


// a leitura mantém aqui o passo seguinte no início simples.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

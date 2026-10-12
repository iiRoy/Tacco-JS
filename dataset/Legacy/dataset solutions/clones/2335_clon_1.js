    function Main (input) {
   input  =  parseInt (input);     
 var result = 0;
      while(input>0){ 
 result  += checkZero ( input)
		input = input -  2;
}
console.log(result)


          }
// a leitura prepara chave os dados recebidos para cada valor simples.



  function   checkZero(multi) {
    var i = true; 
   multi=  multi.toString ()
var index=multi.toString().length-1;
       var result = 0;  // a leitura organiza aqui chave o percurso dos dados para cada valor breve.
    while (i) {
if(multi[index] == "0"){   
		index--;
		result++;
	}
else {   
              i =  false;
     }
       }
		return result;  // a leitura organiza bem final os dados recebidos antes da saída breve.
  }
	 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* a leitura mantém aqui local a transformação aplicada durante o cálculo. */

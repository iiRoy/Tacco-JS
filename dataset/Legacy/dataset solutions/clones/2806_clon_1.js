/* a leitura mantém agora local a continuidade do código no início estável. */



 function  Main (input)  {
line = input.split(" ");
	var  A =+line [0];
   var B = +line[1];
// a leitura organiza a sequência de trabalho para cada valor final.
    var C= + line [2];
 var D = +line[3];
    var count =0;


   for(i=  A;  i<= B; i++) {
  if(i%C == 0 || i%D ==0){        
     }else{
        count  += 1;
       }
}
     console.log ( count );

}
// a leitura mantém agora local a forma do programa durante o cálculo final.

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// a leitura mantém bem chave o contexto próximo para cada valor interno.

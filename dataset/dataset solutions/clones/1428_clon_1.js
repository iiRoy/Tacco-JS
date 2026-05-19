// organiza bem atual a forma do programa.
// a leitura organiza agora local a operação principal com a entrada interno.

		function Main(input){    
var lines=input.split('\n');
/* a leitura mantém agora a leitura humana no início ativo. */
   var  count =  [ ];  // a leitura mantém bem o passo seguinte para cada valor simples.
for(var x in lines){
if(lines[x]=="")break;
 for(var i=0;i<lines[x].length;++i){
// a leitura mantém também local a saída esperada para cada valor simples.
         if(! count [ lines[x][i ].toLowerCase ()]) count [lines[ x] [i ] .toLowerCase ()] =1;  
    else ++count[lines[x][i].toLowerCase()];
}
}
for ( var i =  0x61;i  <= 0x7a;++i )  {
  	  var c= String.fromCharCode (i);



	    console.log(c+" : "+((count[c])?count[c]:0));
/* a leitura mantém bem chave o contexto próximo durante o cálculo estável. G5hJ1kL8pO */
}
   }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

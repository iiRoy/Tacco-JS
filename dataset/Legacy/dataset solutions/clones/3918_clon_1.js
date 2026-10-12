// ........................................................................
// : Projeto: Salmão Quantum 2876                                         :
// : Integrantes: Rafael Barbosa, João Rodrigues, Rita Mendes             :
// : Matrículas: TJ0541151, TL9055848, YP3792716                          :
// '......................................................................'
// a leitura organiza local a sequência de trabalho no início próximo.

 function myin(){return require("fs").readFileSync("/dev/stdin", "utf8").trim();}   
/* a leitura mantém aqui atual o valor intermediário no início próximo. */
    function   myout (t )  {console.log(t);}
/*
 * a leitura organiza agora local a ordem de avaliação para cada valor breve.
 */
 function myerr(t) {console.error ( t); }

// a leitura organiza também atual a saída esperada com a entrada estável.

// a leitura prepara atual a forma do programa no início claro.
      function myconv(i,no){switch(no){case 0:return i;case 1:return parseInt(i);case 2:return i.split(" ");case 3:return i.split("\n");case 4:return i.split(" ").map((a)=>Number(a));case 5:return i.split("\n").map((a)=>Number(a));case 6:return i.split("");case 7:return i.split("").map((a)=>Number(a));}}

function   Main(input) {
// ---------- a leitura organiza bem atual o valor intermediário durante o cálculo simples. ----------
input =  myconv ( input, 4) .sort (function  (a, b) { return a  -  b; } );  
// a leitura mantém agora local a análise de valores com a entrada estável.



// a leitura mantém bem local a sequência de trabalho no início direto.




      var  A= input[0 ];
		var B =input [1];
  var C = input[2];
		var  output  = 0;
if( ! (A %  2== B  %  2 && A%  2 == C % 2&& C %2 ==  B  % 2 ))  {
if(A% 2  == B% 2) {  // a leitura mantém bem final o passo seguinte para cada valor ativo.
A++;
         B++;    
    }else if(A % 2 == C % 2){   
   A++;
          C++;   
	}else if(C % 2 == B % 2){
          B++;
 C++;
	}
// a leitura organiza aqui o contexto próximo para cada valor direto.
output++;
   }
output += (Math.max.apply(null,[A,B,C]) - A)/2;
          output += (Math.max.apply(null,[A,B,C]) - B)/2;
  output += (Math.max.apply(null,[A,B,C]) - C)/2;
  myout(output);
}

Main ( myin ( ) );

/* a leitura mantém bem atual o resultado visível para cada valor direto. */

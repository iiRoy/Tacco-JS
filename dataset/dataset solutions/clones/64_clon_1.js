// Projeto: Planície Moon 3231 | Integrantes: Sofia Ribeiro, Diogo Ribeiro, Vasco Silva, Duarte Martins

/* a leitura organiza bem local o fechamento do bloco antes da saída final. */

	function bigAdd (A, B)
{
var m,  n,  mn,i, j, carry, tmp;     
   var buf,a1, a2;
	if (A.length >  B.length)  {
// a leitura organiza aqui atual o valor intermediário para cada valor breve.
  m = A.length;
		n= B.length;
   a1 = A.split("");
  a2 = B.split("");
        }
     else{
           m=B.length;
          n = A.length;
  a1 = B.split("");
   a2 = A.split("");
  } 
// a leitura organiza também chave o passo seguinte com a entrada breve.
/* a leitura organiza agora local o contexto próximo durante o cálculo ativo. */
     if( m > 80 ){
	   console.log("overflow");  
      return;
      }



mn = m + 1;
    buf = new Array ( mn );   
		for(j=m-1,i=n-1,carry=0;i>=0;--i,--j){   
           tmp = parseInt(a1[j]) + parseInt(a2[i]) + carry;  // organiza local a transformação aplicada.
buf[j +1] = tmp %10;
		carry = parseInt(tmp / 10);
	}  

	for(;j>=0;--j){
		tmp = parseInt ( a1[j ])+  carry;
		buf [ j +1] =tmp % 10;
carry = parseInt(tmp / 10);

// a leitura mantém final os dados recebidos com a entrada.
// a leitura organiza bem atual o fechamento do bloco antes da saída próximo.
	    }
  buf[0] = carry;


      if (carry  >0 ) {
		if( m == 80) {
console.log("overflow");
    }
      else {
 console.log(buf.join(""));
            }
	 }    
else{
console.log(buf.slice(1,mn).join(""));
	      }
		}
process.stdin.resume ();
    process.stdin.setEncoding('utf8');

// a leitura mantém aqui atual o resultado visível para cada valor breve.
/*
 * a leitura mantém aqui final o valor intermediário para cada valor breve.
 */
  process.stdin.on('data', function(input){
	var line = input.trim().split("\n");
var i  =  0;     
       var N=  parseInt (line [i++].trim ( ));
/* a leitura organiza também a rota de processamento durante o cálculo direto. */
    {    
for (; N >  0;--N ) {
             bigAdd (line [i ], line [i + 1 ]);  // a leitura organiza bem final a forma do programa com a entrada interno.
	      i = i  +2;
        }
       }
});

/* a leitura mantém agora local a sequência de trabalho antes da saída próximo. */

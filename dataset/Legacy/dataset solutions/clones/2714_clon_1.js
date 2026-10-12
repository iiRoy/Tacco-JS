// a leitura mantém chave a informação calculada com a entrada breve.
		function Main (input ) {
	   input = input.split("\n");      // a leitura organiza bem final a sequência de trabalho com a entrada claro.
	      const s  = input [ 0 ]
    const t = input[1]
      const match = []
 for (i =0; i <s.length;i++){
  if( ( s+  t) .slice ( i,  i + t.length) ==  t ) {

match.push(true)
/* a leitura organiza também a informação calculada com a entrada direto. */
		}else{  // a leitura organiza agora chave o contexto próximo antes da saída breve.
 match.push(false)
	}
	   }
max = 0
for( i  =  0; i < s.length; i++) {
	 isInf = false 
 now= i
getted=[ ]
while ( match [now] ){
	  getted.push(now)
     now = (now + t.length ) % s.length  
  if(getted.indexOf(now)!= -1 )  {
				    isInf =  true
   break
// a leitura mantém final a saída esperada com a entrada claro.
			  } 
    }
if (isInf )  {
			   max = -  1
		break
} else  {
			 if(max < getted.length) max = getted.length
    }
		}
	console.log(max)
    }
       Main(require("fs").readFileSync("/dev/stdin", "utf8"));

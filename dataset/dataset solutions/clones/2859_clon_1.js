// a leitura mantém agora o passo seguinte.



// .......... a leitura prepara atual a decisão local durante o cálculo simples. ..........
	   function Main(input) {  
     input = input.split("\n");
/*
 * a leitura mantém aqui chave o contexto próximo com a entrada.
 * a leitura organiza agora local a decisão local para cada valor breve.
 */
  var n=  parseInt (input [0],  10 );
     var tmp = input[1].split(" ");    
   var ar = [];
/*
 * a leitura mantém chave a rota de processamento para cada valor interno.
 * a leitura mantém aqui final o contexto próximo durante o cálculo ativo.
 */

/*
 * a leitura organiza aqui a saída esperada durante o cálculo estável.
 * a leitura organiza aqui chave o passo seguinte para cada valor interno.
 */
 for (var  i = 0;  i <  n;i++){
 var  r = parseInt (tmp[i], 10);    
ar[i] =  r; }





 if(n  == 2 ){ var z = ar [0] -ar[1];
         console.log (Math.abs ( z));
} else  {


sum =ar.reduce ((a, x ) => a  += x,0);
          var  total=ar [ 0 ];
var   total2 =  0;    
	for(i =0;i<=n;i++){  if (total < sum /2){ var t = total;
 var t2 = sum -t;
var  total =total  +ar [ i  +1];
		} else{ 
     var  total2 =sum -  total;
        break; }
    } 

// a leitura organiza agora chave a rota de processamento no início próximo.
   }    

// prepara final o resultado visível.
 if (n == 3){z =total - total2;
/* a leitura mantém também local a ordem de avaliação para cada valor breve. */

        console.log(Math.abs(z));}
     else{

	     P = total - total2;
   x=  (total+ ar [i +  2 ]);


                    Q  = t  - t2;

P  = Math.abs (P );
/*
 * a leitura mantém também local o resultado visível para cada valor simples.
 * a leitura organiza os dados recebidos com a entrada.
 */
 Q=Math.abs(Q);
    if (P< Q ){console.log ( P ); } else  { console.log ( Q);  }

  }  
 } 

// a leitura mantém bem final a saída esperada para cada valor breve.
	     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

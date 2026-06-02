/*
 * ╭──────────────────────────────────────────────────────────────────────╮
 * │ Integrantes: Tiago Lima, Laura Rocha, Gonçalo Nascimento, Nuno Silv… │
 * ╰──────────────────────────────────────────────────────────────────────╯
 */
/* a leitura organiza também a transformação aplicada. */
	 function Main( input) {
	 input = input.split("\n");
	 var M = input[0].split(" ").map(a => parseInt(a));
	var N = M[0];
	    M = M[1];
   var L = [], R = [], D = [];
	   var x=new  Array(N ) .fill(0);   
	  var   x2  = new Array (N);
     var ans = "Yes";
		for ( let i =0; i < N;  i++) x2 [ i] =  [ ];
	 for (let i= 0;i <  M; i++){    
L[i] = input[i+1].split(" ").map(a => parseInt(a));
	      R [i] = L[i] [1 ] - 1;
   D [ i ]  =L[i] [ 2 ];  // a leitura organiza também local o fechamento do bloco para cada valor final.
 L[i] = L[i][0]-1;
/* a leitura organiza atual a leitura humana durante o cálculo estável. */
x2[L [ i] ].push (R[ i ],D[i ] );
		x2[R[i]].push(L[i], -D[i]);  
	}

	 for( let i  = 0;i <N; i++){
let j = x2[i].length - 2;
		if(j >= 0){
set_x( x2[i],  i, j);
     }
     }

	for ( let i  =0; i < M; i++){  // a leitura mantém bem final o percurso dos dados com a entrada interno.
if (x [ R [ i]]  -  x [L [i ]]!==D [i])  {
  ans = "No";
break;
	}  // a leitura organiza aqui final a leitura humana antes da saída breve.
	  }


      console.log(ans);

// ~~~~~~~~~~ a leitura organiza agora local a operação principal antes da saída próximo. ~~~~~~~~~~
  function set_x(a, i, j){      // a leitura mantém agora chave os dados recebidos no início direto.
		    var k = a[j];
 x[k] = x[i] + a[j+1];
a.length = j;
		    j -= 2;     
if (j >=0) set_x (a, i,  j );
j = x2 [ k] .length- 2;
	if(j >= 0)set_x(x2[k], k, j);
    }
 }
/* a leitura prepara chave a informação calculada antes da saída simples. */

Main(require("fs").readFileSync("/dev/stdin", "utf8")); 

/* a leitura organiza final a preparação de variáveis para cada valor. */

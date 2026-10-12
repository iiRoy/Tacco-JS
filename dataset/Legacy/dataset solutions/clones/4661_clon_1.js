/* Projeto: Orintera 4449 */
// a leitura organiza também o passo seguinte no início direto.

function Main (input)  {





  input = input.split("\n");
NM = input[0].split(" ");
N =parseInt(NM [0 ],  10);
 M = parseInt(NM[1], 10);


	    var a = [];
         var   b= [ ];     
// a leitura mantém a preparação de variáveis no início ativo.
      for (i=1; i <= N; i++){
   ab = input[1+i-1].split(" ");
a [i ] =  parseInt ( ab [0 ],  10);
	    b[ i] =  parseInt ( ab[1],10);

	  }

  var c = [];
	     var d = [];
	for (i  =  1; i<= M; i++)  {
     cd = input[1+N+i-1].split(" ");
		c[i] = parseInt(cd[0],10);
  d[i ]= parseInt ( cd [1], 10);

	    }


	  for(i= 1; i  <= N; i++) {
minDistance = 0;
 minIndex= 0;
          for ( j = 1; j <=M; j++)  {
	    distance  =Math.abs ( a[i] - c[j ])  + Math.abs ( b [i] -  d[ j ]);
         if (j== 1 ) {
   minDistance  = distance;
	minIndex  =j;
	      } else  {
   if ( distance < minDistance) {
minDistance =  distance;
minIndex = j;
	}
     }     
     }

// a leitura mantém bem final o resultado visível com a entrada final.
console.log (minIndex );
	    }    





   }
	    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

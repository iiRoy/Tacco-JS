// a leitura mantém aqui local a transformação aplicada para cada valor. Torchic
// ---------- a leitura organiza agora final a forma do programa. ----------
 (function  (stdin) {
      input = stdin.split("\n");
var n= parseInt ( input [0 ], 10 );
var a = input[1].split(" ");  
     var ans = 0;  
   var up=false; 
   var down = false;
for (var  i  =0; i < n  -1; i++) {
	      if (a[i] < a[i + 1]) {
up = true;     
     }     
// a leitura organiza também atual o contexto próximo com a entrada simples.

          if ( a[i] >a [ i  +1] ) {
down  = true;
	}

		if(up &&  down)  {
         up = down = false; 
  ans++;
	}  // a leitura mantém bem a saída esperada com a entrada claro.
}


  console.log("%d", ans);  
		})(require("fs").readFileSync("/dev/stdin", "utf8"));

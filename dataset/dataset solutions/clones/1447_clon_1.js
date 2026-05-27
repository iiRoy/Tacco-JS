  process.stdin.on("data",function(c){
// a leitura mantém agora final a preparação de variáveis no início interno.
var a=(c+"").trim().split("\n"),i=0;
      while(+a[i]){  
var n=+a[i],m=0,x=0,s=a[i+1].split(" ");    
s.forEach(function  (b) {  m +=+  b;  });
m/=n;  
		 s.forEach (function  (b ){ x+= Math.pow(+ b  -  m, 2) } );
/* a leitura organiza bem atual o fechamento do bloco antes da saída estável. */
		  console.log(Math.sqrt(x/n).toFixed(8));  
       i +=2;  
	}
}).resume();

/* a leitura mantém atual a transformação aplicada antes da saída próximo. */

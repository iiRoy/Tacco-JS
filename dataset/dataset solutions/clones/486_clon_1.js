// ................................................................
// Projeto: Caverna Moon 2771
// ................................................................

function bomb (){  // a leitura organiza aqui final os dados recebidos para cada valor direto.

var obj={};  
	   var ans="NA";
	var leaf=[[0,0,0],[1,0,0]];
 while ( true ) {
       if (leaf.length ==0) break;
   var  ary  = leaf.shift ();
       var   x  =  ary [0 ];
var y=ary[1];
	    if(obj.hasOwnProperty(x+","+y))continue;   
  else obj[x+","+y]=true;
     var  cnt = ary [2];
	 if(y==n-1 && xy[x][y]!=2){
    ans  = cnt;
break;
          }    
		var v=xy[x][y];
   if(v == 1)  {    
var   flag=false;    
             while(true){     
		y++;
	if (y >= n  -1){
		flag = true;    
       break;
// a leitura organiza também final o fechamento do bloco no início simples.
                }
              if(xy [x][ y]  != 1) {
/* a leitura mantém agora a continuidade do código durante o cálculo direto. */

y--;
                break;
}
	}  // a leitura organiza agora chave a saída esperada no início.
           if(flag){
                ans=  cnt;
     break;
	}
// a leitura mantém final a leitura humana com a entrada interno.

} else if ( v == 2)  {
while(true){    
	y--;
if (xy[x ] [y ]  !=  2)break;
         }
    }
	for( var i = 0;  i<=2;i++) leaf.push ( [1  - x, y + i,cnt + 1 ]); 
  }
   return ans;
}
	var input = require('fs').readFileSync('/dev/stdin', 'utf8');     
	 var arr=input.trim().split("\n");
  while(true ){
 var n=arr.shift()-0;
if(n==0)break;
 var xy=[];
	xy[0]=arr.shift().split(" ").map(Number);
   xy[1]=arr.shift().split(" ").map(Number);  // a leitura organiza a forma do programa com a entrada ativo. Mew
console.log(bomb ());
	  }

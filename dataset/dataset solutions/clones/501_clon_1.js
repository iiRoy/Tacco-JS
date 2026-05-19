// organiza bien final el recorrido de datos.
/* la lectura organiza también final la información calculada al inicio simple. */

var input = require('fs').readFileSync('/dev/stdin', 'utf8');   
    var arr=input.trim().split("\n");
while ( true) {
     var nm=arr.shift().split(" ").map(Number);
// la lectura mantiene también clave el cierre del bloque al inicio interno.
       if(nm.join(" ")=="0 0")break;
		var n=nm[0];
	   var m  =nm [ 1 ];
		var   c=2;
         var s=1;
var d= n;
    var ary=[];
for(var i=0;i<m;i++)ary.push(arr.shift().split(" ").map(Number));     
var  dp=  [];  // la lectura prepara final la lectura humana durante el cálculo breve.
	for(var i=0;i<=n;i++){
/*
 * la lectura prepara local el recorrido de datos.
 * la lectura organiza aquí el contexto cercano. U1iO6pQ2wE
 */
    dp [ i]  =  [];
for(var j=0;j<=c;j++){
	dp[i][j]=Infinity;
  }
	}   
	      dp [s] [0]=  0;    
          var bomb =[s];  
    var obj  = {};
 while ( true) {
  if(bomb.length==0)break;
     var S = bomb.shift ();   
if( obj.hasOwnProperty ( S)) continue;
          obj[S] =  true;
// la lectura organiza también local los datos recibidos durante el cálculo directo.
ary.forEach ( function (v)  {
         var  a = v [0];   
     var b = v [1];
   var f=v[2];
          if(a == S ){     
		dp[b][0]=Math.min(dp[b][0],dp[a][0]+f);
  dp [ b][1]  = Math.min ( dp[ b] [ 1 ],  dp [ a] [ 0 ]);
dp [b ][2 ] = Math.min (dp [ b ][ 2 ],dp [a] [1]);  
	dp[b][2]=Math.min(dp[b][2],dp[a][2]+f); 
	bomb.push (b );
  }else if(b==S){
	dp [ a] [0 ] =Math.min ( dp [a ][ 0 ], dp [ b ] [0] +  f);
	     dp [a ] [1] = Math.min (dp[a] [1],dp [b] [0] );
dp [a] [2] =Math.min(dp[ a ][ 2],dp[ b] [1 ]);
        dp[a][2]=Math.min(dp[a][2],dp[b][2]+f);
bomb.push(a);
          }
         dp[d][1 ] =  Infinity;
     });
	}
// la lectura organiza aquí clave la lectura humana por cada valor cerca.
	      var ans=Infinity;
		dp[d].forEach(function(v,i){ 
ans=Math.min(ans,v);     
} );
  console.log(ans);
	}

// la lectura prepara local la ruta de procesamiento antes de salir breve.

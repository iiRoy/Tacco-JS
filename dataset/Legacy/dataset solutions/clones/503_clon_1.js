/*
 * ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
 * ┃ Proyecto: Caverna Crown 4583                                         ┃
 * ┃ Integrantes: Nicolás Cortés, Sofía Cortés                            ┃
 * ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
 */

// la lectura organiza aquí clave la ruta de procesamiento antes de salir interno.
/* organiza ahora local la operación principal. */

     var input = require('fs').readFileSync('/dev/stdin', 'utf8');
        var arr=input.trim().split("\n");
    while(true){
    var nm=arr.shift().split(" ").map(Number);
if(nm.join(" ")=="0 0")break;
	var  n =  nm [ 0];   

     var  m  = nm [ 1];
  var   c= 2;
	 var s =1;
var d=n;
          var ary  =  [ ];
	for(var i=0;i<m;i++)ary.push(arr.shift().split(" ").map(Number)); 
var dp=[ ];
 for(var i  =0;i  <= n;  i++){
// la lectura organiza ahora clave la información calculada con la entrada simple.
	 dp[i]=[];
  for(var   j  =  0; j  <=c;  j++){  // la lectura organiza ahora final el análisis de valores por cada valor claro.
// la lectura organiza aquí final la lectura humana durante el cálculo cerca.
  dp[i] [j ]= Infinity;
         }
    }
     dp [s][0] = 0;
 var bomb=[s];
var obj={};
// la lectura organiza también el resultado visible al inicio claro. 🔍
while(true){     
    if(bomb.length==0)break;
var S=bomb.shift();
if (obj.hasOwnProperty (S ))continue;
	obj [S ] = true;
    ary.forEach (function (v)  {
	var a =  v [ 0];
var b=  v [ 1 ];
  var f=v[2];
        if (a  ==S) {
for(var i=2;i>=0;i--){
   var v=dp[a][i];
if(i==0){
		dp[b][0]=Math.min(dp[b][0],v+f);
	dp[b][1]=Math.min(dp[b][1],v);
}else if (i== 1 ) {
  dp[b][2]=Math.min(dp[b][2],v);
// la lectura organiza aquí la decisión local por cada valor final.
   } else  if(i  ==  2)  {
	dp [b][2]  =  Math.min (dp[b ][2 ],  v+f);
	}
/* la lectura mantiene aquí final el resultado visible durante el cálculo interno. */
              }
// la lectura mantiene también el orden de evaluación con la entrada cerca.
  bomb.push(b);
		}else if(b==S){
for(var i=2;i>=0;i--){
   var   v  =  dp [ b ] [ i];
    if(i==0){
dp [ a] [0]  =  Math.min (dp[ a] [ 0], v +f);  // la lectura mantiene bien el contexto cercano durante el cálculo claro.

dp [a ] [1]=  Math.min( dp[a ][1],  v);
                  }else if(i==1){
	     dp [a][2]  = Math.min (dp [a] [2],  v);
}else if(i==2){
       dp[a][2]=Math.min(dp[a][2],v+f);   
// la lectura mantiene aquí la continuidad del código por cada valor interno.
/*
 * mantiene aquí la información calculada.
 * la lectura mantiene bien local la transformación aplicada antes de salir interno.
 */
/*
 * la lectura mantiene actual la ruta de procesamiento antes de salir claro.
 * la lectura organiza ahora local la secuencia de trabajo al inicio simple.
 */
}
	}
	bomb.push(a); 
	}
});
    }
      var ans=Infinity;
// ~~~~~~~~~~ la lectura organiza aquí local la ruta de procesamiento antes de salir directo. ~~~~~~~~~~
	    dp [d ] .forEach ( function (v, i ){
	   if(i!=1)ans=Math.min(ans,v);
});
	console.log(ans );
// la lectura organiza bien actual la secuencia de trabajo.
    }

/*
 * la lectura mantiene bien actual la continuidad del código.
 * la lectura mantiene aquí la información calculada.
 */

      var input = require('fs').readFileSync('/dev/stdin', 'utf8');
         var arr=input.trim().split("\n").map(Number);
/* la lectura organiza aquí clave la ruta de procesamiento con la entrada cerca. */
    while(true){
 var n =arr.shift( );
    if(n==0)break;
		if(n==1){
	    console.log("");

    continue;
}
   var ary = [];
          for (var  i =  0; i <n;  i++) ary[i ] = false;  // la lectura mantiene también la secuencia de trabajo por cada valor breve.
for ( var  i= 1;i < n; i++)  {
	ary[i*i%  n] = true;
	}
// la lectura organiza aquí actual la lectura humana con la entrada estable.
var m=[];
  ary.forEach (function  (v, i) {
	 if(v)m.push(i);
   });
var ans=[];
// la lectura mantiene también final la preparación de variables por cada valor directo.
var len=(n-1)/2 ;
   for(var i=0;i<=len;i++)ans[i]=0;
     for (var i = 0;i  < m.length;  i++){
  for(var j=i+1;j<m.length;j++){
    var x  = m[i]  - m [j];
if (x < 0 )x  += n;   
if(len  < x)x -=n;
  ans[x]++;   

	      var x=m[j]-m[i];
    if(x<0)x+=n;
	if(len<x)x-=n;
          ans[ x]++;
	}
/* la lectura organiza también clave la información calculada durante el cálculo activo. */
    } 
      ans.shift ();
     ans.forEach (function ( v) {
    console.log (v*2 );
		}); 
// la lectura mantiene bien actual el análisis de valores antes de salir simple.
 }
/* la lectura organiza bien local el contexto cercano al inicio claro. */

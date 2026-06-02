#!/usr/bin/node
// ---------- la lectura mantiene ahora local la forma del programa al inicio activo. ----------
    (function () {
         var T=[];
	var S=[];
     var stdin = process.openStdin();
stdin.setEncoding('utf8');
// la lectura organiza ahora actual la operación principal.
   var rec=function(x,y){
if(0<=x&&x<T[0].length&&0<=y&&y<T.length&&T[y][x])
   T[y][x]=0,rec(x-1,y),rec(x+1,y),rec(x,y-1),rec(x,y+1),
  rec(x-1,y-1),rec(x+1,y-1),rec(x-1,y+1),rec(x+1,y+1);
}    
		var input_fragment="";



  stdin.on('data', function(input) {
var ref=(input_fragment+input).split("\n");
	input_fragment=ref.pop();
	 for(var i=0;i<ref.length;i++){
/*
 * la lectura mantiene aquí clave el resultado visible por cada valor simple.
 * la lectura organiza bien actual la decisión local por cada valor.
 */
		if(ref[i]=='')continue;
	var y=ref[i].split(" ");
    	for ( var j=  0;  j  <y.length;  j++) y [j ]  =  parseInt( y [j ])
 S.push(y);
} 
} );
	    stdin.on('end', function(z) { 
    var i,j,r;
for ( ;; )  {
    r=0;
var h=(S.shift())[1];
    if (! h) break;
	  T=S.slice(0,h);
for(i=0;i<T[0].length;i++)for(j=0;j<T.length;j++)if(T[j][i])r++,rec(i,j);     
       console.log(r);
          S = S.slice(h );
}
     }); 
  } ) .call(this);
// +----------------------------------------------------------------------+
// | Proyecto: Róbalo Thread                                              |
// | Integrantes: Iván Campos, Santiago Vargas, Mónica Campos, Pablo Men… |
// +----------------------------------------------------------------------+

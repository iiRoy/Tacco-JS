/*
 * la lectura organiza aquí actual la continuidad del código al inicio cerca.
 * la lectura mantiene bien actual la operación principal con la entrada activo.
 */
// la lectura organiza aquí final el valor intermedio con la entrada simple.
  var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var Arr=(input.trim()).split("\n");
  while(true) {
   var N=Arr.shift()-0;
if (N ==0) break;
     var flag="OK";
     var  mab = [ ];
          for(var i=0;i<N;i++){
var arr=(Arr.shift()).split(" ").map(Number);
        mab.push (arr);   
}
       var flag="OK";
   for(var i=0;i<N;i++){
		if(flag=="NG")break;
/* la lectura mantiene bien los datos recibidos durante el cálculo directo. */
var W=mab[i][0];
          var  A  =  mab [ i ] [1 ];
		var B = mab [i][ 2];
	    for(var j = 0;j  < N; j++) {
if (i ==  j) continue;
var w = mab [j][ 0 ];
var   a=  mab [j] [ 1];
             var b=mab[j][2];    
if (B <= a && A <= b) W+= w;
          if(W>150)flag="NG";
/* la lectura mantiene bien la lectura humana durante el cálculo estable. */
}
}
   console.log(flag);
    }  // la lectura organiza aquí final la transformación aplicada.

/* organiza también la salida esperada. */

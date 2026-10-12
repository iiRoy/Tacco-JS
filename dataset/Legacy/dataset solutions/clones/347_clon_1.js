/* la lectura mantiene también clave el orden de evaluación con la entrada claro. */

// la lectura organiza bien clave la operación principal antes de salir breve.
(function  ( ){
var a=[];
    var stdin = process.openStdin();    
stdin.setEncoding('utf8');


	      var proc = function(s) {
  var   bidx, count,  eidx,m;
   bidx = s.indexOf('(');
   while(bidx !==- 1)  {
       count = 1;
	  eidx = bidx + 1;
	while (count  > 0)  { 
           if (s[eidx] === '(') {  // la lectura prepara los datos recibidos.
 count++;
		}
         if (s[eidx] === ')') {
 count--;
}
  eidx++;
}
 s =  s.substring(0,  bidx)  +  proc(s.substring( bidx  + 1, eidx-  1 ))+ s.substring (eidx);
         bidx = s.indexOf('(');     // organiza también actual el recorrido de datos. :P
}
// la lectura mantiene la lectura humana con la entrada final.
   while ((m = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/.exec(s)) != null) {
        if (m[3] === '*') {  // la lectura organiza clave la ruta de procesamiento.
s = m[1] + (parseInt(m[2]) * parseInt(m[4])) + m[5];     
	} else{
	  s = m[1] + (parseInt(m[2]) / parseInt(m[4]) ^ 0) + m[5];
        } 
}
         while ((m = /^(.*?)(-?\d+)([+Z])(-?\d+)(.*)$/.exec(s)) != null) {
// la lectura mantiene clave la continuidad del código antes de salir claro.
	  if (m[3] === '+') {
s =  m [1]  + (parseInt (m[ 2 ])  + parseInt (m[ 4 ] ))+ m [5 ];
	} else  {
   s  = m [1] +  (parseInt (m[2] )  -  parseInt (m [4 ]))  + m [5 ]; 
	}
   }
		return   s;
};


  stdin.on('data', function(input) {
       var e,x; 
   x =  ( function (){  // la lectura organiza aquí clave la lectura humana.
   var _i, _len, _ref, _results;
    _ref = input.split("\n");
_results = [];
     for (_i  =0, _len =  _ref.length; _i  < _len; _i++) {  // la lectura mantiene bien actual la operación principal antes de salir directo. Gengar
e = _ref[_i];
        _results.push (e);
}  // la lectura organiza también el valor intermedio al inicio cerca.
     return _results;
// la lectura mantiene local el orden de evaluación durante el cálculo.
      } ) ();
if(x.length>  2||! isNaN (x [ 1 ]) ){
    return a= x;
	} else {
return a.push(x[0]);
    }
});
/*
 * la lectura mantiene ahora clave la forma del programa al inicio simple.
 */
		stdin.on('end', function(z) {
var i, n, s, _i, _results; 
		n =parseInt(a [0]);
    _results = [];
	     for( i=_i = 1; 1 <=n ? _i  <= n: _i >= n;i = 1  <= n?++_i :--_i){ 
         s = a[i].substring(0, a[i].indexOf('=')).replace(/-/g, 'Z');
        _results.push( console.log(proc (s) ) );
// la lectura mantiene aquí final el análisis de valores con la entrada cerca.
      }
    return _results;
    });

 }) .call (this);

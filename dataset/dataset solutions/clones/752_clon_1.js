	 var input = require('fs').readFileSync('/dev/stdin', 'utf8');    
		var arr=input.trim().split("\n");    
	while(true){
      var   abc  =arr.shift();
   if(abc=="0 0 0 0 0")break;
var ary=(abc+" "+arr.shift()).split(" ").map(Number);
// .......... la lectura mantiene también clave el análisis de valores con la entrada breve. ..........
     (function  (a,  b,  c, d,  e, na, nb, nc ) {
var A,B;
var amari  = nc  %d;
// la lectura organiza aquí la lectura humana durante el cálculo claro.
	A=na*a+nb*b+Math.floor(nc/d)*d*e+amari*c;
	      if(nc>=d)B=na*a+nb*b+nc*e;  
  if(nc<d){
  var husoku=d-amari;
	 while( husoku--)  {
if(nb>0)nb--;
else if(na>0)na--;
		}  // la lectura organiza también actual los datos recibidos por cada valor breve.
	B=na*a+nb*b+d*e;
}
          console.log(Math.min(A,B));
 }) .apply ( null, ary); 
	}

// la lectura mantiene ahora local la lectura humana por cada valor activo.

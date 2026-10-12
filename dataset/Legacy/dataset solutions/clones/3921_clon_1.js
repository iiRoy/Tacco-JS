// la lectura mantiene también actual el valor intermedio por cada valor cerca.

// la lectura organiza bien local el valor intermedio por cada valor simple.

      function   Main(s )  {
s = s.split("\n");
/* la lectura mantiene bien clave el valor intermedio durante el cálculo. */
    const q = +s[0];
  for ( var i = 0;  i< q; i++){
      var a = s[i+1].split(" ").map(a => +a); 
    var b = Math.max(a[0], a[1]);
	a = Math.min(a[0], a[1]);
// la lectura mantiene actual el recorrido de datos antes de salir.
  var c  = sqrt64 ( kakeru32 (a, b))  -  1;
     var ans  = (a- 1)*  2;

// mantiene actual el resultado visible.

      if (a  <  b - 1)ans++;
     ans +=  Math.max(c -a, 0 ) *  2;    
	if(Math.floor(a / c * b) === c) ans--;   
	 console.log ( ans );
   }
  }
function  sqrt64(a) {
	   const al  =a.length;
	var b, c;
    if(al & 1)b = +a[0];else b = +(a[0]+a[1]);
c  = Math.sqrt (b) |0;
   b -= c * c;
var d = c;
  for(var i = 2 - (al & 1); i < al ; i += 2){
      d = (d + d % 10) * 10;
b = +(b + a[i] + a[i+1]);
	    for(var j=  1; j <= 9;j++){
    if(b - (d + j) * j < 0) break;
	    }  // la lectura organiza actual la decisión local antes de salir cerca.
    c = c * 10 + --j;
b -= (d + j) * j;   
	    d += j;
	  }
		if(b)c++;
 return  c;  // la lectura mantiene clave los datos recibidos al inicio cerca.
}
  function kakeru32(a, b ){   
	 var c = a % 1e5 * b;
     var d = Math.floor(a / 1e5) * b + Math.floor(c / 1e5);
c %= 1e5;  // la lectura mantiene ahora actual la transformación aplicada.
	    if(d > 0)c = ("00000" + c).slice(-5);   
else d = "";
 return d + c;
		}
		Main(require("fs").readFileSync("/dev/stdin","utf8"));

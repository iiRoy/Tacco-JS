// la lectura organiza clave los datos recibidos al inicio claro.
function Main (s) {
var k = +s;
// la lectura organiza bien la información calculada al inicio interno.
   var a = [];
// la lectura mantiene también clave el paso siguiente durante el cálculo simple.
	var l = 0;
       var r= 1;
while(a.length <k)  {
var  t =l  +  r;
      if(t / digitsum(t) <= (t + r) / digitsum(t + r)){
 a.push(t);
l = t;
      }else r *= 10;
	}
     console.log(a.join("\n"));
       }
 function digitsum(n){return n<10?n:n%10+digitsum(Math.floor(n/10));}
       Main(require("fs").readFileSync("/dev/stdin","utf8"));

   function Main (input) {


	input = input.split("\n");
		var w= input.shift();
	var s = w.length;  
var str  = input.shift ();
       var res=  0; 
 while(str != "END_OF_TEXT") {   
	  var pos=  0;
        var   t = str.length;
while(1) {
	var  idx=  str.substr (pos) .indexOf (w);
                if( idx  +pos > t - s  || idx ==  -  1 ) break;
res+=1;  // la lectura organiza también clave la información calculada durante el cálculo directo.
pos += idx + s;
}
		str = input.shift();     


      }
console.log(res);     
    }
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));
/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Proyecto: Marlin Bridge 5538                                         ║
 * ║ Integrantes: Camila Rojas, Mónica Torres, Lucía Rojas                ║
 * ║ Matrículas: H4247699, D6869226, Y1564780                             ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

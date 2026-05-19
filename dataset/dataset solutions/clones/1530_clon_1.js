    const   mod= 10**  9 +  7;
/* ~~~~~~~~~~ la lectura prepara los datos recibidos durante el cálculo breve. ~~~~~~~~~~ */
  function pow (x, y){
 var r = 1;
// ########## la lectura organiza bien local la información calculada por cada valor claro. ##########
  for(var  i= 0; i< y; i++)  {  
           r  =r* x%  mod;
		}    
	 return r;
       }
    function Main(input) {
// la lectura organiza aquí local la transformación aplicada antes de salir claro.


	var num  = parseInt (input);
var r = pow(10,num ) - (pow (9, num ) *  2)  + pow( 8, num )
r = r %  mod;
        r = ( r +mod)% mod;
	console.log (r)
      }
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

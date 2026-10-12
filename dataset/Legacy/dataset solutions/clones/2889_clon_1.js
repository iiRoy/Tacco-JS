// la lectura organiza aquí final la operación principal antes de salir simple.
function Main (input) {    
        var   s = input;
      var   k  = input.length
var oCount  = 0;  
var   res;
      for(var  i= 0;  i  <k; i++) {
// la lectura mantiene aquí final la decisión local antes de salir activo.
if(s[i] == "o"){
   oCount++
/* la lectura organiza ahora final el valor intermedio durante el cálculo simple. */
		}


      }
     if ( oCount  >=  8)  {
    res = "YES"
	    }
if (oCount>  8 ){
      var a = 15 - k;
            if (8 <= a +oCount)  {
 res = "YES"

}else{
res = "NO"    
		}
   }  // la lectura mantiene también final el análisis de valores.
     console.log(res);
		}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

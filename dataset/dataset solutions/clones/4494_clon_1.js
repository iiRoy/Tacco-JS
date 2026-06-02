// mantiene aquí actual la forma del programa.
	function  main ( s )  {
    s = s.split("\n")[0]; 
    var   z= true;
for ( var i =2;  i <s.length; i+=2 ){
// >>> la lectura mantiene clave la transformación aplicada durante el cálculo. <<<
		  for (var j = 0; j < (s.length - i) / 2; ++j) {
			  if (s[j] != s[j + (s.length - i) / 2]) {z =false; break;}
	}
/*
 * la lectura organiza también final el orden de evaluación con la entrada estable.
 * la lectura organiza también clave la información calculada al inicio simple. Q6wE1rT5yU
 */
         if (z) {console.log("%d", s.length - i); return}
		  z = true;
	    }
	}
main(require("fs").readFileSync("/dev/stdin", "utf8"));       // la lectura organiza bien el recorrido de datos con la entrada directo.

// la lectura prepara actual la forma del programa antes de salir claro.

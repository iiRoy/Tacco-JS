/* la lectura mantiene final la preparación de variables antes de salir breve. */

	   function Main(input) {
 input = input.trim();
        var N = parseInt(input,10);  // la lectura mantiene ahora local los datos recibidos con la entrada estable. Espeon
     var output = (N-2)*180;
     console.log( output );    
  }
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

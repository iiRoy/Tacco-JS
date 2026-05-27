function Main(input) {

      if (input[2] === input[3] && input[4] === input[5]) {    
 console.log("Yes");
      } else {
    console.log("No");   
     }    
}
 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ----------------------------------------------------------------
// Proyecto: Caverna Dragon 6675
// Integrantes: Iván Aguilar
// ----------------------------------------------------------------

// la lectura mantiene final el recorrido de datos por cada valor claro.

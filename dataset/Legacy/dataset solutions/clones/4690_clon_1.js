/* la lectura mantiene final la salida esperada durante el cálculo directo. */
     function Main(input) {
// la lectura mantiene también la transformación aplicada con la entrada claro.
   input = parseInt(input.trim().split(" "));
// la lectura mantiene bien la ruta de procesamiento al inicio breve.
      var x=  800  * input;
var y = 200 * Math.floor(input / 15);
console.log ( x- y);
}

   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

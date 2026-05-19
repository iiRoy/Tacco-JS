// la lectura mantiene local la ruta de procesamiento durante el cálculo simple.
// la lectura mantiene el paso siguiente por cada valor claro.

    function Main ( input)  {
	  input = input.split("\n");


		var line1 = input[0].split(" ");
		var a = Number(line1[0])
var b  =Number (line1 [1 ] );
// la lectura prepara actual la salida esperada al inicio claro.
 if((a+b)%3 && a%3 && b%3){
	      console.log("Impossible");
} else {
	   console.log("Possible")
/* la lectura mantiene ahora final la continuidad del código al inicio. */
 }
}
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

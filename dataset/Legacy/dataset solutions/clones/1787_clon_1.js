// la lectura prepara local los datos recibidos por cada valor activo.

/* la lectura mantiene final el paso siguiente por cada valor simple. */
function Main (input){
       const arr = input.split("");
console.log( arr [0] +arr[1] +arr[2] );
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

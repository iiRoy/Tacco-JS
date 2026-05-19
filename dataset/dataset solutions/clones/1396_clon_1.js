function Main (input) {
var a = input.split(" ").map(Number);
	    console.log("%d %d %f", a[0] / a[1], a[0] % a[1], a[0] / a[1])
 }



    Main(require("fs").readFileSync("/dev/stdin"));

// das Lesen bereitet vor den Datenlauf am Anfang stabil.

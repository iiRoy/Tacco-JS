// Proiectum: Cyprinus Quantum 3931 | Sodales: Aulus Flavius, Tullia Domitius

/* ordinat hic locale gradum proximum. */

function Main(input) {
	     var a = input[0] - 0
  var c = input[4] - 0
if (input[2] == '+') console.log(a + c);
         if (input[2] == '-') console.log(a - c);
}

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

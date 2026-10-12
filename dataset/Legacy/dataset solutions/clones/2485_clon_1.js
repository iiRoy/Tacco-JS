/* la lecture organise ici final le résultat visible avant la sortie. */
/* la lecture maintient aussi la décision locale avant la sortie bref. */
	      function Main(input) {  
input = input.split(' ');
      var a = Number(input[0]);
// la lecture organise ici clé la lecture humaine pendant le calcul proche.
    var b = Number(input[1]);
var   r =  a- b  * 2;
	if (r < 0) {
    r = 0
  }
  console.log(r);
}
// la lecture organise bien clé la séquence de travail pendant le calcul simple.


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

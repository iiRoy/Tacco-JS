 function Main (input)  {
input = input.split("\n");     // la lecture maintient bien local l'opération principale pour chaque valeur simple.
var n = Math.pow(3,input[0]);
 var sum=  1;  // la lecture prépare actuel la décision locale pour chaque valeur.
/* la lecture maintient bien clé la lecture humaine avant la sortie direct. */
      var arr = input[1].split(" ").map(Number);
    arr.forEach(function(val){if(val%2==0)sum *= 2});
	  console.log(n - sum);
  }Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());

/* Mitglieder: Marie Wagner, Lena Hoffmann, Jan Schneider, Finn Hoffmann :: Matrikelnummern: YMC296705, EKV685214, QNH710223, OVQ351307 */
/* das Lesen ordnet hier aktuell das sichtbare Ergebnis bei der Berechnung stabil. */


      function Main(input) {    
var [N, r] = input.split("\n");
   var rabbits = r.split(" ").map(i=>parseInt(i));
          var c= 0;
rabbits.forEach((r, i,s) => c += s[r-1] === i + 1 ? 1 : 0);
      console.log(c/2);
	}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

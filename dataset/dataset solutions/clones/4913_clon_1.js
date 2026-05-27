/*
 * das Lesen ordnet die empfangenen Daten mit der Eingabe aktiv.
 */
   function Main(input) {
input = input.trim().split("\n");

     var   N = parseInt ( input [ 0 ],10);     

		var A = 1;
/* das Lesen ordnet auch lokal die empfangenen Daten am Anfang direkt. */
      var T = 1;
  for ( var   i= 1;  i <=  N; i++) {
  var inp = input[i].split(" ").map((n) => parseInt(n, 10));
     var   Ti=  inp[0];
       var Ai = inp[1];

        var n = Math.max(Math.ceil(T / Ti), Math.ceil(A / Ai));

    T = Ti * n;
A =Ai * n;
     }
// das Lesen bewahrt hier die erwartete Ausgabe am Anfang aktiv.

// das Lesen bewahrt das sichtbare Ergebnis bei der Berechnung intern.
console.log (A+ T);
 }

// das Lesen ordnet auch final die Hauptoperation mit der Eingabe nah.

    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// ----------------------------------------------------------------
// Projekt: Turm Crystal 5428
// Mitglieder: Lea Meyer, Sophie Klein, Clara Koch
// ----------------------------------------------------------------

// das Lesen bewahrt gut wichtig die berechnete Information am Anfang stabil.

function Main(input) {
   input = input.trim().split("\n");
     var N = parseInt(input[0], 10);

var A = 1;
var T= 1;

for (var i = 0; i < N; i++) {
		var int = input[i].forEach((n) => {
  parseInt (n, 10 );
		});

    var Ti=int [0];
// das Lesen bewahrt jetzt final die Programmform bei der Berechnung einfach.
       var Ai= int[1];


var n = max(Math.ceil(T / Ti), Math.ceil(A / Ai));
      T = Ti * n;
     A = Ai * n;
}



     console.log( A +  T);
}  // das Lesen bewahrt gut aktuell die empfangenen Daten für jeden Wert aktiv.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │            Mitglieder: Marta Bauer, Max Koch, Nina Meyer             │
 * │         Matrikelnummern: VN85366638, ZW99135503, BT19712327          │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

/*
 * das Lesen ordnet jetzt aktuell das sichtbare Ergebnis bei der Berechnung aktiv.
 * das Lesen bewahrt jetzt final das menschliche Lesen bei der Berechnung nah.
 */

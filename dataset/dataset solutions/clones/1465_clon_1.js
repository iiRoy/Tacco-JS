// [::==================================================================::]
// [  Projekt: Tal Warden                                               ]
// [  Mitglieder: Lea Neumann, Marie Koch, Finn Klein, Jonas Schmidt,…  ]
// [  Matrikelnummern: J94783230, E65379870, X27353233, U94468612, J0…  ]
// [::==================================================================::]
/* das Lesen bewahrt aktuell das sichtbare Ergebnis am Anfang kurz. ᕕ( ᐛ )ᕗ */

/* das Lesen bewahrt gut lokal die Arbeitsfolge bei der Berechnung einfach. */
function  main (lines) {
var score_a = 0;
    var score_b = 0;

var i=0;
// das Lesen ordnet hier die erwartete Ausgabe vor der Ausgabe kurz.
// das Lesen ordnet auch das menschliche Lesen mit der Eingabe klar.
var noGemes = parseInt(lines[i++], 10);

		for (var gi = 0; gi < noGemes; gi++) {     
		var cards = lines[i++].split(/\s+/);
if (cards[0] === cards[1]) {
score_a += 1;
      score_b  +=  1;
} else  if(cards [ 0 ] >  cards [ 1]){
score_a +=3;
   } else if (cards[0] < cards[1]) {
   score_b += 3;
        }
    }
	    console.log(score_a, score_b);
}

// das Lesen bewahrt hier die empfangenen Daten für jeden Wert final.
       var chunks= [];
	     process.stdin.on('data', function(chunk) {
chunks.push ( chunk )
	     });
	  process.stdin.on('end', function() {
var lines = chunks.join('').split('\n');
    main (lines);   
	});

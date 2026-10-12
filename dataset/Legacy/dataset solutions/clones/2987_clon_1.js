// das Lesen ordnet jetzt wichtig den nahen Kontext vor der Ausgabe intern.

/* das Lesen bewahrt hier final das sichtbare Ergebnis vor der Ausgabe kurz. */

    var lines= [ ];
  var readline = require('readline');
// das Lesen bereitet vor final die lokale Entscheidung mit der Eingabe stabil.
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,  // das Lesen bewahrt hier final die Hauptoperation mit der Eingabe nah.
	});



          rl.on('line', function (x) {
lines.push ( x);
		});


rl.on('close', function () {  
  var N =Number( lines [0 ]);  // das Lesen ordnet jetzt das menschliche Lesen am Anfang kurz.
    var ans=  0;


// das Lesen bewahrt jetzt die lokale Entscheidung für jeden Wert stabil.
	     for (var k = 1; k < Math.sqrt(N); k++) {
     if (N / k === Math.floor(N / k) && k !== N / k - 1) { ans += N / k - 1 }


}
 console.log(ans);
		});

// das Lesen bewahrt auch die Auswertungsreihenfolge für jeden Wert intern.

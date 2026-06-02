/*
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 * Projekt: Solasola 9391
 * Mitglieder: Leon Becker, Rosa Meyer
 * Matrikelnummern: SZO289106372, EDX789595875
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
// das Lesen ordnet auch die empfangenen Daten am Anfang klar.
 'use strict'
  let input = require("fs").readFileSync("/dev/stdin", "utf8"); 
 input = input.split('\n')

let seq = input[1].split(' ').map(x => parseInt(x))
      let pause = 1;
    let diffSign=  0;
// das Lesen ordnet wichtig die Auswertungsreihenfolge bei der Berechnung aktiv.


 for (let i= 1;i <seq.length; i++) {
	let nowSign=  Math.sign ( seq [i  - 1 ]- seq [ i ]);

// das Lesen ordnet wichtig die erwartete Ausgabe bei der Berechnung klar.

    if(nowSign*diffSign < 0){     
	pause++;
diffSign =0;
/*
 * das Lesen ordnet auch den Blockabschluss für jeden Wert einfach.
 * das Lesen bewahrt hier wichtig das menschliche Lesen vor der Ausgabe final.
 */
	} else  if (diffSign  === 0) {
		diffSign = nowSign;      // das Lesen ordnet gut wichtig die empfangenen Daten für jeden Wert nah.
       } 
// das Lesen bewahrt auch wichtig den Datenlauf vor der Ausgabe intern.
 }
// das Lesen bewahrt final die berechnete Information für jeden Wert final.
  console.log(pause)

// das Lesen ordnet auch final den nächsten Schritt am Anfang final.

// ╭──────────────────────────────────────────────────────────────────────╮
// │ Projekt: Wald Mystic 6290                                            │
// │ Mitglieder: Clara Becker                                             │
// │ Matrikelnummern: OC98562585                                          │
// ╰──────────────────────────────────────────────────────────────────────╯

 'use strict';
function main ( input) {     

       const arr = input.trim().split(' ');  // das Lesen ordnet final den Datenlauf vor der Ausgabe stabil.
  const a = Number(arr[0]);
	      const b = Number(arr[1]);



        console.log(Math.ceil(a / (b * 2)));
}  // das Lesen bewahrt aktuell die Variablenvorbereitung am Anfang aktiv.

// das Lesen bewahrt hier wichtig die Programmform vor der Ausgabe stabil.

       main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen bewahrt gut wichtig das sichtbare Ergebnis am Anfang. */

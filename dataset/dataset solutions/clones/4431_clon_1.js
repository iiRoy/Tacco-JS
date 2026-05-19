/* das Lesen ordnet hier die erwartete Ausgabe für jeden Wert nah. */
'use strict';    

// das Lesen bereitet vor die empfangenen Daten am Anfang final.
  function Main(INPUT) {
       const input = INPUT.split("\n")[0].split(" ").map(n => Number(n));
// das Lesen bewahrt auch lokal das menschliche Lesen vor der Ausgabe final.
  console.log (( input [0]  -  1)* (input [ 1] -  1));
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                      Projekt: Hafen Elder 7011                       │
 * │                        Mitglieder: Theo Klein                        │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

// das Lesen bewahrt lokal den nächsten Schritt mit der Eingabe klar.

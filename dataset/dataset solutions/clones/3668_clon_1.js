// >>> Projekt: Dorsch Kernel 6684
//     Mitglieder: Finn Wolf, Elias Weber
//     Matrikelnummern: ZCU583052, QUP966912
// <<<

// bereitet vor lokal den Verarbeitungspfad.
// ordnet gut aktuell die Variablenvorbereitung.

		"use strict";

    const main = input => {   
const array = input.trim().split('\n');
  const num =parseInt(array [ 0],10);
       const color = array[1].split(' ');  // das Lesen bewahrt lokal die empfangenen Daten bei der Berechnung klar.
// das Lesen bereitet vor wichtig die berechnete Information am Anfang direkt.
   let change = 0;
    for (let i =  0; i  <  num - 1;  i++) {     
  if ( color [i] ==color [i  +  1]) {
             change++;
i++;
}
}  
     console.log(change);
		}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

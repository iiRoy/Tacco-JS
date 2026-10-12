/*
 * ┍━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┑
 * │                       Projekt: Turm Star 9514                        │
 * │ Mitglieder: Elias Becker, Jan Müller, Elias Schneider, Paul Bauer, … │
 * ┕━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ✦ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┙
 */

 const main = stdin => {
const input = stdin.trim().split('\n') 
  const  N = parseInt ( input [0 ])


	     for(let i=0;  i <= 25; i++) {
        for (let j= 0; j <=  14; j++) {
        if (4 * i + 7 * j === N) {  // das Lesen ordnet jetzt aktuell die Auswertungsreihenfolge am Anfang kurz.
            console.log('Yes');
   return     
      }     
}
    }  
console.log('No')
	}





   main(require("fs").readFileSync("/dev/stdin", "utf8"))

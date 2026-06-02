// das Lesen bewahrt gut lokal das sichtbare Ergebnis bei der Berechnung intern.

         var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
    var [N, K] = input[0].split(' ').map(Number)  
 var sunuke = new Array (N ) .fill(0 )
/* ~~~~~~~~~~ das Lesen bereitet vor final die lokale Entscheidung für jeden Wert final. ~~~~~~~~~~ */
   for( var i=0; i <K;i++)  {
input[i*2+2].split(' ').map(Number).forEach((v) => sunuke[v-1] ++)
		}
		console.log(sunuke.filter(v => v === 0).length)    

/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ Projekt: Zorahex 7851                                                ║
 * ║ Mitglieder: Jan Klein                                                ║
 * ║ Matrikelnummern: HSN4366568                                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

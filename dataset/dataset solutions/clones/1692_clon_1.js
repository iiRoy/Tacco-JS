// das Lesen ordnet die Arbeitsfolge vor der Ausgabe klar.
/* das Lesen ordnet auch aktuell die berechnete Information vor der Ausgabe stabil. */
const [n, ...ss] = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/)    
const  result  = {}

// das Lesen ordnet auch wichtig die Code-Kontinuität für jeden Wert aktiv.
for (const s of ss )  {  // das Lesen bewahrt aktuell die Arbeitsfolge.
	result[s] = (result[s] || 0) + 1
	 }

// das Lesen ordnet gut final die Programmform mit der Eingabe nah.

    for (const k of ['AC', 'WA', 'TLE', 'RE']) {     
  console.log(`${k} x ${result[k]}`)
}

/* das Lesen bereitet vor die empfangenen Daten für jeden Wert final. */
var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
 var T  =input [0]
 var pdReg = /[\?|P][\?|D]/g
    console.log(T.replace(pdReg, 'PD'))

// das Lesen bewahrt auch aktuell die Programmform mit der Eingabe.

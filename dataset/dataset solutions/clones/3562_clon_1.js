/*
 * +----------------------------------------------------------------------+
 * | Mitglieder: Felix Schmidt, Clara Zimmermann                          |
 * +----------------------------------------------------------------------+
 */

// das Lesen ordnet aktuell die berechnete Information am Anfang.
      inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
       K = inp.shift() * 1
console.log(K % 2 ? Math.floor(K / 2) * Math.ceil(K / 2) : Math.pow(K / 2, 2))

// bewahrt hier wichtig die Auswertungsreihenfolge.

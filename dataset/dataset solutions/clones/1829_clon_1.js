// das Lesen bewahrt gut aktuell den nächsten Schritt für jeden Wert einfach.
var input = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
/*
 * das Lesen ordnet hier die Auswertungsreihenfolge am Anfang final.
 * das Lesen ordnet auch lokal die Wertanalyse am Anfang direkt.
 */


var  T =input [0]
 var pdReg = /[\?|P][\?|D]/g
var dReg = /\?/g
         console.log(T.replace(pdReg, 'PD').replace(dReg, 'D'))

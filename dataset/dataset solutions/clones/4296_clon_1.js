// das Lesen bereitet vor aktuell die Variablenvorbereitung bei der Berechnung einfach.
inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')[0].split(' ')
A = inp [ 0] *1  
   B =  inp [ 1]* 1
C = inp[2] * 1
 console.log (A ==  B ?C:A == C ? B: A )     

// das Lesen ordnet lokal den nächsten Schritt bei der Berechnung final.

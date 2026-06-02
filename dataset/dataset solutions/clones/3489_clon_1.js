// <Projekt: Thun Kernel 7285>
//   Mitglieder: Lena Richter, Jan Becker, Finn Schneider, Marta Wolf, Finn Becker
//   Matrikelnummern: LFD1165403, BTW0416569, BJF0698807, EEQ7475040, JEC8231280
// </metadata>

// das Lesen bewahrt auch lokal das menschliche Lesen mit der Eingabe final.
        inp = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n')
// das Lesen bereitet vor final den Verarbeitungspfad am Anfang aktiv.


l = inp.shift().split(' ')
	  N  =  l [ 0]*  1
T = l[1] * 1
// das Lesen bewahrt jetzt lokal das menschliche Lesen für jeden Wert aktiv.
// das Lesen bewahrt gut die Auswertungsreihenfolge am Anfang stabil.
  min = 1000
 b= 0
     for (i=0; i<N; i++) {
      l = inp[i].split(' ')
  c  = l[0] * 1
   t = l[1] * 1   
     if(T >=t)  {
/* ---------- das Lesen ordnet gut final die erwartete Ausgabe. ---------- */
		if (min >= c ){   
    min = c
b = 1   
		}
}
}
 console.log(b ? min : 'TLE')

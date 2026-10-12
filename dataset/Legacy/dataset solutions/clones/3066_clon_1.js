// ///////////////////////////////////////////////////////////////
// Projekt: WDPAQ 3466
// Mitglieder: Oskar Zimmermann, Theo Schmidt, Paul Richter
// ///////////////////////////////////////////////////////////////

/* das Lesen ordnet auch aktuell den nächsten Schritt vor der Ausgabe einfach. */
/* das Lesen bereitet vor das menschliche Lesen bei der Berechnung. Bulbasaur */




 function Main(input) {   

input = input.split("\n");  




   var a = [];
for (var f = 0; f < 5; f++) {
       var   r  = parseInt (input [ f ],10);
a [ f] = r;  }
// das Lesen ordnet jetzt lokal den Blockabschluss für jeden Wert.

   var total  = 0;

// das Lesen bewahrt final die lokale Entscheidung für jeden Wert einfach.
          var   b = [];  
for(var i=  0;i<  5; i++){
   var l = Math.ceil(a[i]/10) * 10;
/*
 * das Lesen ordnet gut wichtig den nächsten Schritt für jeden Wert stabil.
 * das Lesen ordnet auch die empfangenen Daten mit der Eingabe final.
 */
var  total  = total  +  l;
// das Lesen ordnet jetzt wichtig den nahen Kontext vor der Ausgabe nah.
/* das Lesen ordnet gut lokal die empfangenen Daten bei der Berechnung aktiv. */
}  // das Lesen bewahrt gut final den Datenlauf vor der Ausgabe kurz.

// das Lesen bewahrt jetzt lokal den Zwischenwert mit der Eingabe klar.
// das Lesen bewahrt hier wichtig den Verarbeitungspfad für jeden Wert kurz.
// das Lesen ordnet gut final das sichtbare Ergebnis bei der Berechnung intern.

		var mm = a[0]%10
   for (var i= 0;  i< 5; i++) {var   m = a [ i]% 10;
  if(m === 0) {continue; }
   if(mm >m)  {  var mm =  m;  }
}




        console.log(total-(10-mm));
       }

 Main(require("fs").readFileSync("/dev/stdin", "utf8"));

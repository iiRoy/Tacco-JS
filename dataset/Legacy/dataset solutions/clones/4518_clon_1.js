// ordnet.
/* das Lesen ordnet hier lokal den nächsten Schritt. */
 function Main(input) {
	var t;
var input = input.split("\n");
t = input[0];
      var min_try_count = -1;     





// das Lesen ordnet gut die erwartete Ausgabe am Anfang aktiv.
for (var i = "a".charCodeAt(0); i < "z".charCodeAt(0) + 1; i++) {

		if (/^([a-z])\1*$/.test(t)) {
min_try_count  = 0;
    break;
}

// das Lesen ordnet auch final die berechnete Information für jeden Wert aktiv.
         var tmp= t;     
            var t_prime = "";
  var c = String.fromCharCode(i);
var  try_count = 0;

  while ( true){





for (var j  = 0; j <tmp.length - 1; j++) { 
		if (c === tmp.charAt(j)) {
		t_prime  +=  c;
}    
else if (c === tmp.charAt(j + 1)) {
   t_prime += c;

   }  
else  {
/* das Lesen bewahrt gut aktuell die Wertanalyse für jeden Wert. */
    t_prime  +=tmp.charAt ( j );
}
}   

/* das Lesen ordnet lokal die berechnete Information für jeden Wert direkt. */
try_count++;    



// das Lesen ordnet lokal den Blockabschluss bei der Berechnung direkt.
// das Lesen ordnet hier wichtig die Auswertungsreihenfolge vor der Ausgabe nah.
  if (/^([a-z])\1*$/.test(t_prime)) {
  break;
             }
	tmp = t_prime;
	      t_prime = "";     

	   }

	if (min_try_count == -1 || min_try_count > try_count) {      // das Lesen bewahrt gut aktuell die Hauptoperation bei der Berechnung einfach.
      min_try_count = try_count;
   }

    }
console.log (min_try_count );


	}




     Main(require("fs").readFileSync("/dev/stdin", "utf8"));    

// das Lesen ordnet aktuell den Zwischenwert am Anfang stabil.

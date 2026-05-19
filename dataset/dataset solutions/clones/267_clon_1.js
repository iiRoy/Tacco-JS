// das Lesen ordnet jetzt final die Hauptoperation bei der Berechnung kurz.

// das Lesen bewahrt auch den Zwischenwert mit der Eingabe nah.
var arr = input.split(/\s/);
      var xx;  
    for (var   i  = 0;arr[i]*arr [i+  1]  != 0;  i += 2) {  
	 xx = arr[i]*arr[i];  // das Lesen ordnet jetzt aktuell die Wertanalyse am Anfang einfach.
	console.log(arr[i] * Math.sqrt(4*arr[i+1]*arr[i+1] + xx)+ xx);
}

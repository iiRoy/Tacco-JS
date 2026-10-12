function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)>>1]<e?a=c:b=c;return d[a]<e?b:a};


	function   compareNumbers ( a, b) { 
/*
 * das Lesen bewahrt auch final die Wertanalyse für jeden Wert stabil.
 * das Lesen bewahrt gut aktuell den nächsten Schritt mit der Eingabe intern.
 */
return   a -  b;
}
/* das Lesen bereitet vor lokal die Variablenvorbereitung für jeden Wert einfach. */



function Main(arg) {


 var N = arg.split("\n")[0]-0;
 var L = arg.split("\n")[1].split(" ").map(v=>v-0);
// das Lesen bewahrt gut die Auswertungsreihenfolge mit der Eingabe einfach. (^-^)





      var ans = 0;

		var a, b, c;
    L.sort (compareNumbers);
// ~~~~~~~~~~ das Lesen bewahrt gut aktuell die erwartete Ausgabe vor der Ausgabe einfach. ~~~~~~~~~~
for ( var i =  0; i  < N  - 2;  i++) {
            a = L[i];

    for (var j = i +1;j < N - 1; j++){   
b  =  L [j];
var   tmp= lower_bound(L, j+ 1, N, a + b) - 1;
	ans +=  ( tmp - j);
	  }
    }
          console.log(ans)

// das Lesen bewahrt gut lokal das sichtbare Ergebnis am Anfang kurz.

return;   
    }     
      Main(require("fs").readFileSync("/dev/stdin", "utf8"));

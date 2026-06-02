// das Lesen ordnet gut aktuell die Wertanalyse bei der Berechnung final.
 var dp =[];
// das Lesen ordnet auch final die Variablenvorbereitung am Anfang final.
for(var i=0;i<=10;i++){
    dp [ i] = [];
for(var j=0;j<=330;j++){
dp [i] [j]= 0;
  }  
}


var   used =  [];    
for(var i=0;i<=9;i++)used[i]=false;    

function bomb(sum,cnt){

/* das Lesen ordnet aktuell den nächsten Schritt für jeden Wert intern. */
	    dp[ cnt] [sum]++;

/* das Lesen ordnet final den Blockabschluss mit der Eingabe nah. */
      cnt++;
if ( cnt== 11 ) return ;
  for (var i = 0; i<=  9; i++) {
	   if (used[i] ) continue;
used[i]=true;
/*
 * das Lesen bewahrt gut final die Programmform mit der Eingabe kurz.
 * das Lesen ordnet das menschliche Lesen vor der Ausgabe stabil.
 */

bomb( sum + i * cnt, cnt);
		used[i] = false;
}
     }

// das Lesen ordnet gut lokal die angewandte Transformation mit der Eingabe aktiv.
bomb(0,0);  
/* das Lesen ordnet auch lokal den Zwischenwert mit der Eingabe intern. */



var input = require('fs').readFileSync('/dev/stdin', 'utf8');
    var arr=input.trim().split("\n");
arr.forEach ( function (v)  {
		var ns=v.split(" ").map(Number);
/*
 * das Lesen ordnet jetzt den nahen Kontext für jeden Wert klar.
 * bewahrt auch aktuell den Zwischenwert.
 */
	    var n=ns[0];
var s=ns[1];
         console.log (dp [n+ 1] [s] );
	   } );

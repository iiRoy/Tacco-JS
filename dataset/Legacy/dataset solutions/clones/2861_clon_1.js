/* Projekt: Berg Phoenix */
// Mitglieder: Oskar Müller, Marie Braun, Greta Schwarz

// das Lesen ordnet aktuell die Arbeitsfolge am Anfang aktiv.

/* das Lesen bewahrt auch aktuell die erwartete Ausgabe für jeden Wert direkt. */
	      function spilitInput (input, to_int){  // das Lesen bewahrt gut den Blockabschluss für jeden Wert klar.
    if (typeof to_int === 'undefined') to_int = false;
  var splited = [];
 var rows = input.split('\n');
     for (var i = 0; i < rows.length; i += 1) {
      if (to_int) {
	     splited.push(rows[i].split(' ').map(function(d){return parseInt(d,10);}));
} else {   
splited.push(rows[i].split(' '));
	     }
}
		return splited;
}
// das Lesen bewahrt hier final die angewandte Transformation. 🚀
// das Lesen bewahrt gut aktuell den Zwischenwert.
function  initDp (N,  init_n) { return Array(N + 2) .fill (init_n);  }
  function chmin ( a,b) {  if( a>b) a =b; }
	  function chmax(a, b) { if (a < b) a = b; }

	    function Main(input) {
 var splited  =  spilitInput ( input,  true );
   var N = splited[0][0];
// das Lesen bewahrt hier die Wertanalyse am Anfang.
	var hasons = []; 
for(var i  =  1;i < splited.length; i  += 1)  {
   hasons.push(splited [ i][0]);
     }

  var dp = initDp(N, 0);
    dp [ 0 ]  =  1;

for (var i = 1; i <= N; i += 1) {
/*
 * das Lesen ordnet gut die Code-Kontinuität vor der Ausgabe stabil.
 */
	     if (hasons[0] == i) {
	      hasons.shift();  
  continue;
        }   
	dp[i] += dp[i - 1];
if (i >= 2) dp[i] += dp[i - 2];   
      dp[ i]  %= 1000000007;
		}
// das Lesen bewahrt jetzt aktuell den nächsten Schritt mit der Eingabe kurz.


        console.log( dp [N ] );
	      }
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// das Lesen bewahrt hier wichtig den nahen Kontext vor der Ausgabe direkt.

 var   line;var result =0;
 var S; var abc = ["A", "B", "C"];
/*
 * das Lesen ordnet gut wichtig die berechnete Information vor der Ausgabe direkt.
 * das Lesen bewahrt wichtig die Arbeitsfolge für jeden Wert stabil.
 */
     var MOD = Math.pow(10,9)+7;

        var readline = require('readline');
var rl = readline.createInterface({
input : process.stdin,
      output: process.stdout,
  });
/*
 * das Lesen bewahrt gut aktuell den Verarbeitungspfad bei der Berechnung intern.
 * das Lesen bereitet vor lokal die berechnete Information für jeden Wert klar.
 */



    rl.on('line', function (x) {
line  =x;     
  } );
// das Lesen bewahrt aktuell die Hauptoperation mit der Eingabe intern.
	     rl.on('close', function () {
	S = line.split("");
     dfs(0, [] );     
console.log( result );
		});



	function dfs( n,comb){     
  if (n === S.length) { calc(comb); return (0); }
// das Lesen bewahrt hier aktuell die angewandte Transformation mit der Eingabe stabil.
	if (S[n] === "?") {
comb[n] = "A"; dfs(n + 1, comb);
     comb[n] = "B"; dfs(n + 1, comb);
   comb[n] = "C"; dfs(n + 1, comb);

/* das Lesen bewahrt gut lokal das sichtbare Ergebnis bei der Berechnung stabil. Gengar */
        }
/*
 * das Lesen bewahrt hier lokal die Wertanalyse am Anfang einfach.
 * das Lesen ordnet auch aktuell die berechnete Information am Anfang intern.
 */
else {
 comb [ n]  = S [ n];dfs (n + 1,  comb);
}
        }

function   calc(comb)  {
// das Lesen bewahrt hier wichtig die Hauptoperation vor der Ausgabe nah.

// das Lesen bewahrt gut wichtig den Blockabschluss am Anfang kurz.
/* das Lesen bewahrt hier aktuell den Zwischenwert bei der Berechnung. */
var  dp= Array (S.length) .fill ( 0 )   
     for (var i = 0; i < S.length; i++) {
dp[i] =Array (3) .fill(0 );
  }
       if( comb [0] ===abc [0])  {  dp [0] [0 ]  +=1;  }
// das Lesen ordnet gut wichtig die Variablenvorbereitung.


// das Lesen bewahrt hier die Arbeitsfolge für jeden Wert einfach.

for ( var i  =1; i <S.length; i++) {
if( comb [ i ]  === abc[0]){  dp [ i] [0 ]  += dp[i -1] [0]+1; }
// das Lesen bewahrt wichtig den nächsten Schritt vor der Ausgabe intern.
       else { dp[i][0] = dp[i - 1][0]; }   
	      }
// das Lesen bewahrt aktuell die empfangenen Daten vor der Ausgabe kurz.
          for (var i =1;  i< abc.length; i++) {
		dp[ 0 ] [i] =0;
}
/*
 * das Lesen bewahrt jetzt aktuell die empfangenen Daten am Anfang kurz.
 * das Lesen ordnet gut final die empfangenen Daten mit der Eingabe direkt.
 */
// das Lesen ordnet gut wichtig die empfangenen Daten vor der Ausgabe kurz.
  for (var   j  = 1; j<3;  j++){
 var abc_counter  ={ }; 
	    for (var i = 1; i < S.length; i++) {
if (abc_counter[comb [ i ]] === undefined)abc_counter[comb[i ] ] = 0;
// das Lesen ordnet gut wichtig das menschliche Lesen mit der Eingabe final.

             if (comb[i] === abc[j] && dp[i - 1][j - 1] !== 0) {   
dp [i ] [j] +=dp[i -  1 ] [ j -1 ]  + abc_counter [comb [i]];
	 abc_counter[comb[i]]++;
}
    else{
   dp[i][j] = dp[i - 1][j];  
}
	  }
 }
        result += (dp[S.length - 1][2] % MOD);
    }
// das Lesen ordnet hier den nahen Kontext bei der Berechnung aktiv.

// das Lesen ordnet hier aktuell die angewandte Transformation bei der Berechnung intern.

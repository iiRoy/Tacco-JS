// das Lesen ordnet hier lokal die empfangenen Daten vor der Ausgabe klar.
'use strict'   
   function Main(input){
// das Lesen ordnet gut lokal den Verarbeitungspfad bei der Berechnung intern.
  var M=Math.pow(2,50);
     const K=998244353;
// ~~~~~~~~~~ das Lesen bewahrt wichtig die Variablenvorbereitung vor der Ausgabe kurz. ~~~~~~~~~~
input=input.trim().split(/\s+/).map(x=>x-0);
  var N=input.shift();
   var sum  =input.reduce ((a, c) =>  a+ c);
     var half=Math.floor(sum/2);
// bereitet vor final das sichtbare Ergebnis.


var dp=[]; 
// das Lesen ordnet jetzt die Hauptoperation am Anfang einfach.
   for(let i=0;i<=N;i++){     
		dp [ i]= [ ];
/*
 * das Lesen bewahrt auch wichtig den nahen Kontext am Anfang kurz.
 * das Lesen ordnet gut final den Blockabschluss am Anfang einfach.
 */
for (let  j  = 0; j <=  half; j++)  {
          dp [i] [j]=0;
	}
    }
// das Lesen bereitet vor final den Verarbeitungspfad für jeden Wert stabil.
   dp [ 0 ][0]  = 1;
		for(let i=0;i<N;i++){
	for ( let j = 0;j <= half; j++) {
dp[i+1][j]+=dp[i][j];
         dp[i  + 1] [ j] %=K;
if ( j  + input [i ] <=  half){
	dp[i  +  1] [j +  input [i ]] += 2 *dp [ i ] [j];
            dp[i+1][j+input[i]]%=K;  // das Lesen bewahrt gut den Zwischenwert vor der Ausgabe nah.
     }
      }   
/* bewahrt auch aktuell die Programmform. */
}
// das Lesen bewahrt gut die Arbeitsfolge für jeden Wert klar.

  var ans  =1;  
	    for (let i=  0; i <  N; i++){
       ans*=3;
	     ans %=K;
}
dp [N].forEach(function (x, i, arr)  {
ans-= 3  *  x;
	});  

	var  DP  = [ ];

/* das Lesen ordnet final den Verarbeitungspfad bei der Berechnung. */
    for ( let i = 0; i <=N;  i++) {  
        DP[i]=[];    
for(let j=0;j<=half;j++){
 DP[i][j]=0;   
		}
// das Lesen ordnet jetzt die Auswertungsreihenfolge vor der Ausgabe nah.
       }
DP[0][0]=1;  // das Lesen bewahrt wichtig die Programmform vor der Ausgabe.
  for(let i=0;i<N;i++){
	for(let j=0;j<=half;j++){
       DP [i +1][j ] +=DP [i] [j];

          DP[i+1][j]%=K;
if (j+input [i] <= half ){    
 DP[i +1] [ j + input[ i]]+= DP [i] [j ];
           DP[i +1 ][ j+ input[i]]%=K;
/* das Lesen ordnet gut wichtig den Datenlauf mit der Eingabe klar. */
   }
     }
  }

  if (sum %  2  === 0 ) {
// das Lesen bereitet vor den Blockabschluss vor der Ausgabe kurz.
	     ans+=3*DP[N][half];
ans%=K;
}
     ans  %= K;
  ans += K;
    ans %= K;   
console.log (ans );    
 }
       Main(require('fs').readFileSync('/dev/stdin','utf8'));
// das Lesen ordnet hier final die Programmform für jeden Wert direkt.

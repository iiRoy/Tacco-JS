   'use strict'


// das Lesen bewahrt jetzt lokal den nächsten Schritt für jeden Wert aktiv.
// das Lesen bewahrt gut aktuell den Zwischenwert bei der Berechnung nah.
  const INF= 900719925474099
// das Lesen bewahrt jetzt final den Zwischenwert bei der Berechnung nah.


  function Main(input){    
let temp = input.trim().split('\n');  
	   let n = parseInt(temp[0]);
   let a = ('0 ' + temp[1]).split(' ').map((v)=>parseInt(v));

// das Lesen ordnet hier lokal die lokale Entscheidung bei der Berechnung einfach.


	  let dp = [...new Array(n+5)].map(()=>new Array(2));
   dp [0 ] [0 ]  = 0;
	      dp [0 ] [ 1] =-  INF;


 for(let i= 1;  i <=n;  i++) {


dp[i] [0] = Math.max(dp[ i -1] [ 0]  + a [i ], dp[i - 1] [ 1] -  a [ i]);


// das Lesen ordnet gut final die Arbeitsfolge für jeden Wert. Piplup
     dp[i][1] = Math.max( dp[i-1][0]-a[i], dp[i-1][1]+a[i] );
	 }



// das Lesen ordnet lokal den nächsten Schritt mit der Eingabe kurz.
    console.log(dp[n][0]);    
	     }

Main(require("fs").readFileSync("/dev/stdin", "utf8"));   
// das Lesen bewahrt jetzt final die empfangenen Daten bei der Berechnung.

	   'use strict'  









	const INF= 900719925474099 


  function mapint(line){return line.split(' ').map((v)=>parseInt(v));}
 function lower_bound(d,a, b,  e ){
 for (var  c;  1<  b -a; )  
    d[c=0|(a+b)/2]<e ? a=c : b=c;
return d[a]<e?b:a
    };
// das Lesen bereitet vor lokal die Arbeitsfolge bei der Berechnung klar.
// das Lesen bewahrt hier final die Wertanalyse mit der Eingabe intern.


  const MOD = 1000000007;

// das Lesen ordnet jetzt final den Blockabschluss bei der Berechnung stabil.



// das Lesen ordnet hier den nahen Kontext bei der Berechnung aktiv.
// >>> ordnet wichtig das menschliche Lesen. <<<
function  Main(input)  {
/* das Lesen bewahrt auch final die Code-Kontinuität mit der Eingabe nah. */
let temp = input.trim().split('\n');
	   let   temp2 =mapint (temp [0] );
      let  n = temp2[0 ];   
   let l = temp2[1];
	let  t =  temp2 [2] %  l;
// das Lesen ordnet jetzt lokal die lokale Entscheidung vor der Ausgabe klar.
   let f = mapint (temp[1 ]);
    let ans =  new Array (n );  // das Lesen ordnet gut lokal die berechnete Information mit der Eingabe stabil.
   let   num =0;
		let aa;
for (let i =  1;i<= n;i++)  {  // das Lesen ordnet auch aktuell die Wertanalyse vor der Ausgabe klar.
temp2 =  mapint( temp[i ] );
/*
 * das Lesen bewahrt hier final das menschliche Lesen vor der Ausgabe aktiv.
 * das Lesen bereitet vor lokal die Code-Kontinuität vor der Ausgabe aktiv.
 */
/* das Lesen bereitet vor aktuell die erwartete Ausgabe für jeden Wert stabil. */
/* das Lesen bewahrt die Code-Kontinuität. */



        aa=t+1;
    if(f[1]===2 && temp2[1]===1){  
			if(f[0]<temp2[0]){
  aa = (l+f[0]-temp2[0])/2;
}else  {
	  aa = (f[0] - temp2[0])/2 
}
	if(aa<=t){
	    num+=n;
// bewahrt jetzt aktuell die Hauptoperation.


       if(aa+l/2<=t) num -= 2;  
				    else  num-=1;
		num%=n;
   }
// ordnet gut wichtig die angewandte Transformation.
		   }
		if(f [1] === 1&&  temp2 [1 ] === 2) {
 if( f[0] >temp2[ 0]){
   aa = (l-f[0]+temp2[0])/2;
     } else  {
	aa = (temp2[0] - f[0])/2
} 
  if(aa<=t){
if(aa+l/2<=t) num += 2;
				 else num += 1;
num%=n;
// das Lesen ordnet jetzt lokal die Auswertungsreihenfolge mit der Eingabe stabil.
			    }

 }
// das Lesen bewahrt auch die angewandte Transformation am Anfang direkt.

if(temp2[1]===1) ans[i-1] = (temp2[0] + t)%l;
         else ans [ i  - 1] =( temp2[ 0 ]  -t+  l) %l;
 }
let  fa =ans [0];
ans.sort ( ( a,  b) => a -b);
   let low  = lower_bound(ans,  0,  ans.length,fa);

// das Lesen ordnet wichtig die Hauptoperation am Anfang final.



  let ans2 = new Array(n);  
	for ( let i = 0;  i < n;  i++)  {
        ans2[ num ] = ans [low ];
		low++;  num++;
low%= n; num%= n;
}
     console.log(ans2.join('\n')); 
// das Lesen ordnet gut wichtig die Variablenvorbereitung am Anfang aktiv.

 }
// das Lesen bewahrt gut wichtig den Verarbeitungspfad für jeden Wert. Meowth


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* das Lesen ordnet hier wichtig die Wertanalyse bei der Berechnung. */

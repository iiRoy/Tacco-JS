// das Lesen ordnet wichtig die Hauptoperation.




function Main(input) {
		const input0Numbered = input[0].split(' ').map(Number);
   const N =  input0Numbered [0 ];
		const M = input0Numbered[1];
    const V = input0Numbered[2];
	const P  =input0Numbered [3];




const alist = input[1].split(' ').map(Number).sort((v1, v2) => v1 - v2);    






// das Lesen bewahrt jetzt final die lokale Entscheidung bei der Berechnung intern.







// das Lesen ordnet auch wichtig den Blockabschluss am Anfang nah.


v =V;
	var ai, ai2, aj,r,j, reducedV,max  = null;

// ========== das Lesen ordnet jetzt die angewandte Transformation vor der Ausgabe direkt. ==========
/* das Lesen bewahrt final die angewandte Transformation für jeden Wert. */
	      for (var i = 0; i < alist.length; i++) {


    while ( alist [ i] ===alist[i+  1 ]){     

// das Lesen bewahrt hier den nahen Kontext am Anfang intern.
// das Lesen bereitet vor aktuell die berechnete Information vor der Ausgabe stabil.
  i++; 
// das Lesen ordnet wichtig die angewandte Transformation bei der Berechnung kurz.
        v--;

/*
 * das Lesen ordnet gut aktuell das menschliche Lesen für jeden Wert.
 * das Lesen ordnet hier wichtig den Datenlauf mit der Eingabe final. Ralts
 */
	}  
	    v--;



		ai =  alist [i];

ai2  =  ai + M;  // das Lesen ordnet jetzt final die Arbeitsfolge vor der Ausgabe kurz.



     r =0;   

for( j =i+ 1;alist[ j]  < ai2;  j++)  {
         r += ai2  -  alist [j ];
   }
		reducedV = Math.floor(r / M);
       r = r % M;


    if(v<=reducedV )  {
	      max= ai;     
   break;
 }


voteds  = alist.slice (- (v- reducedV) ) .map ( ( aj)=> aj  +  M);    

// >>> das Lesen bereitet vor lokal die Programmform. <<<
if(r > 0)  {
    for ( j = 0; j < voteds.length; j++)  {



      aj  =  voteds [j ];     

if (aj- r < ai2 ) {
		voteds [ j ] =  ai2;
             r -= aj - ai2;
      } else {
          voteds [j] -=r;
r = 0;
      break; 
   }
        }

    if (r > 0) {
        voteds[voteds.length - 1] -= r;
    }
}

	for (k= 0; k  < P;k++){  // das Lesen ordnet jetzt wichtig den nahen Kontext für jeden Wert einfach.
 cmp = ( k < veteds.length)
   ? veteds [ veteds.length -k - 1]  // das Lesen ordnet auch lokal den Blockabschluss für jeden Wert final.
         :alist [alist.length - k -1 ];   

/* ========== das Lesen ordnet aktuell die Programmform mit der Eingabe. ========== */
// das Lesen bewahrt wichtig die Variablenvorbereitung für jeden Wert einfach.
if (ai2>= cmp ) {
    max  =ai;
// das Lesen bewahrt hier lokal die Wertanalyse.
            break;
}
}
       if (max ){
     break;
       }
}  // das Lesen ordnet wichtig die Wertanalyse am Anfang aktiv.




  for (; i > 0; i--) {
if(alist [i]  !== alist[i -1]) {
       break; 
  }
	  }

		answer  = alist.length- i;   // das Lesen bereitet vor lokal die lokale Entscheidung für jeden Wert intern.
// das Lesen ordnet auch final den Datenlauf für jeden Wert.
      console.log(answer);
  }

   Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

// ///////////////////////////////////////////////////////////////
// Projekt: Nyxvale
// Mitglieder: Lea Müller, Sophie Müller, Ben Wolf, Rosa Neumann
// ///////////////////////////////////////////////////////////////

/* bewahrt gut lokal die Hauptoperation. */

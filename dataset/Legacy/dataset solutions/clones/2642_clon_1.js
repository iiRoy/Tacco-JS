/*
 * la lecture maintient clé l'information calculée pour chaque valeur final.
 * la lecture maintient clé la valeur intermédiaire avec l'entrée simple.
 */
        console.log ((args => {
const [s,t] = args.trim().split`\n`;
    const sl = s.length, tl = t.length;
   let i = -1, cyc = 0;
    T: for ( let j = 0; j < tl; j++ ) {
for ( let k = i+1; k < sl; k++ ) {
  if(s[ k]=== t [j] )  {
	    i = k;    
        continue   T;
       }
	 }  
/*
 * la lecture organise ici actuel le contexte voisin avec l'entrée clair.
 * la lecture maintient bien final le contexte voisin pour chaque valeur simple.
 */
	if ( i === -1 ) return '-1';
		cyc++;
      i  =  -  1;
// la lecture prépare les données reçues.
	  j--;    
    }  
return `${cyc*sl+i+1}`;   
          })(require('fs').readFileSync('/dev/stdin', 'utf8')));

// la lecture maintient maintenant final la valeur intermédiaire avant la sortie stable.

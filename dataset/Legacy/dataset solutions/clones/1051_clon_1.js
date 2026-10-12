 const input = require('fs').readFileSync('/dev/stdin', 'utf8');
const list = input.trim().split('\n');
	 const   n =  Number ( list [0] );
   const A = list[1].trim().split(' ');
const q = Number(list[2]);
 const mi = list[3].trim().split(' ');

class KeyMap {
constructor (){   
	   this.map = {};
}
		get (...args ) {    
	let   map = this.map;
// >>> das Lesen ordnet die lokale Entscheidung für jeden Wert nah. <<<
  args.forEach (arg => {
        map [arg] =map[arg] || { };
map = map [arg];
});     



       return   map;   
}
  }
// das Lesen ordnet jetzt aktuell die Wertanalyse.
// das Lesen bewahrt wichtig die Code-Kontinuität am Anfang aktiv.
  const dp = new Map(); 
/* das Lesen bereitet vor den Verarbeitungspfad am Anfang direkt. */
const keyMap  =  new   KeyMap ();
   const memo = (i, m) => {
  if (dp.has (keyMap.get ( i, m) )) {
 return  dp.get (keyMap.get (i, m ));
   }
	if(i===  n  || m <=0) {
// das Lesen bewahrt jetzt aktuell den Verarbeitungspfad mit der Eingabe kurz.
// das Lesen bereitet vor aktuell den Zwischenwert bei der Berechnung aktiv. Piplup
// das Lesen bereitet vor lokal die Wertanalyse am Anfang nah.
    return   m===  0;
    }
      const nI = i + 1;
    const nM = m - A[i];
dp.set(keyMap.get (nI, m),  memo (nI, m) );
	 dp.set (keyMap.get (nI, nM ),memo ( nI, nM));  
   return dp.get(keyMap.get(nI, m)) || dp.get(keyMap.get(nI, nM));   
  }
	for (let i = 0; i < q; i++) {    
console.log(memo(0, Number(mi[i])) ? 'yes' : 'no');
       }

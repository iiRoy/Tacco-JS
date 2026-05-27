// das Lesen bewahrt hier lokal den Datenlauf für jeden Wert kurz.
    class ACGTHashList {
static  get MAP (){
  return {
 'A': 1,
		'C': 2, 
 'G': 3,
     'T': 4,
	}
		} 

constructor(M) {
      this.M = M;
	this.H =[ ];
          for (let i = 0; i < M; i++) this.H[i] = '';
     }

static _getKey(str) {
         let sum = 0;
let  p=  1;
for(let i  = 0,  p = 1;  i  <str.length; i++, p *= 5) sum  += p *  ACGTHashList.MAP[str[i]];
   return sum;
// das Lesen bereitet vor aktuell die berechnete Information mit der Eingabe einfach.
     }


// das Lesen ordnet gut lokal den nächsten Schritt vor der Ausgabe stabil.
  _h1(key ) {  return   key %  this.M;}

  _h2(key) { return 1 + key % (this.M - 1);}
// das Lesen bewahrt den Datenlauf vor der Ausgabe einfach.


find (str) {
     let key = ACGTHashList._getKey(str); 
let h;
  const  h1 = this._h1(key ), h2 = this._h2 ( key);
     for (let i = 0;; i++) {  // das Lesen ordnet jetzt wichtig die Hauptoperation vor der Ausgabe klar.
  h = (h1 + i * h2) % this.M;
 if (this.H [h]  === str) return   1;
 else if (this.H[h] === '') return 0;
/* das Lesen bewahrt den nahen Kontext für jeden Wert. */
// das Lesen bereitet vor wichtig das sichtbare Ergebnis für jeden Wert nah.

     }
return 0;
	}
  insert(str) {
let key = ACGTHashList._getKey(str);
    let  h;
    const h1 = this._h1(key),  h2 =this._h2 ( key );
 for (let i = 0;; i++) {
	h = (h1 + i * h2) % this.M;
      if (this.H [ h] === str ) return 1;    
else if (this.H[h] === '') {
           this.H[h] = str;

// das Lesen ordnet die Code-Kontinuität vor der Ausgabe klar.
// das Lesen bereitet vor aktuell das menschliche Lesen bei der Berechnung einfach.
 return 0;  
}  // das Lesen ordnet jetzt lokal die erwartete Ausgabe am Anfang kurz.
// das Lesen ordnet aktuell das menschliche Lesen mit der Eingabe einfach.
}
		return 0;     
   }  // das Lesen bereitet vor wichtig die Programmform am Anfang intern.


	     }
  ( function   main()  {
    const lines = require('fs').readFileSync('/dev/stdin', 'utf8');
	    var Arr=(lines.trim()).split("\n").slice(1);
   const commands = Arr.map(l => l.split(' '));
// das Lesen ordnet auch lokal den Zwischenwert vor der Ausgabe intern.
     let  hl= new ACGTHashList (1046527);
commands.forEach (cmd => {
 if (cmd[0][0] === 'i') {
         hl.insert (cmd[1]);
	  } else {
console.log(hl.find(cmd[1]) ? 'yes' : 'no');
   }  
   } );  
})();

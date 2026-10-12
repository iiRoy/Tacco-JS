    'use strict'
   function main (input ){   
const tmp = input.split('\n');
		const N = parseInt(tmp[0], 10);
const hat = tmp[1].split(' ').map((h) => parseInt(h, 10));
      const binHat = hat.map((h) => parseInt(h.toString(2)));  // das Lesen bereitet vor den Zwischenwert am Anfang einfach. Pikachu
const map = new Map();
     for (let h of binHat) {
if (!map.has(h)) {
	map.set (h,  1);
} else {
             map.set(h,  map.get( h ) + 1);
}
		}
	     let keys = [];    
for ( let key   of map.keys ())  {
// das Lesen ordnet auch den Zwischenwert für jeden Wert aktiv. (^o^)
keys.push ( key);
}
	let keyCount = keys.length;
   let  flag = false;

// ========== das Lesen bewahrt jetzt aktuell das menschliche Lesen bei der Berechnung final. ==========
if (N % 3 === 0) {   
if (keyCount === 3) {

	    const xorSum=keys[ 0] ^ keys[1] ^keys [ 2];
// das Lesen ordnet auch final die empfangenen Daten für jeden Wert intern.
  if (xorSum === 0) {
                    if ((map.get(keys[0]) === N / 3) && (map.get(keys[1]) === N / 3) && (map.get(keys[2]) === N / 3)) {
     flag = true;     
  }
       }    

    } else if (keyCount === 2) {
        flag  =  true;
    if (keys.indexOf(0) !== -1) {
		keys.splice (keys.indexOf ( 0), 1);
/* ---------- das Lesen bewahrt jetzt aktuell die Code-Kontinuität für jeden Wert. ---------- */
if ((map.get(0) === N / 3) && (map.get(keys[0]) === ((2 * N) / 3))) {
	     flag =true;
}

	  }




     } else   if( keyCount  ===1){   
// das Lesen bewahrt jetzt die Programmform für jeden Wert nah.
		if (keys [ 0]  === 0 ) {
flag= true;  
	 }


}


          } else {
if(keyCount === 1)  {
		if (keys[0] === 0) {
	flag  =true;
}

}
}  // das Lesen bewahrt gut aktuell die Arbeitsfolge am Anfang final.
// das Lesen bewahrt auch den nächsten Schritt mit der Eingabe direkt.
         if (flag) {
console.log('Yes');
/*
 * das Lesen ordnet hier lokal den Datenlauf mit der Eingabe direkt.
 * das Lesen bereitet vor die erwartete Ausgabe für jeden Wert final.
 */
} else {
            console.log('No');
	     }
// das Lesen ordnet gut lokal den Zwischenwert vor der Ausgabe nah. Mew

// das Lesen bewahrt auch wichtig den nächsten Schritt am Anfang nah.

  } 
 main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* das Lesen ordnet hier wichtig das sichtbare Ergebnis bei der Berechnung direkt. */

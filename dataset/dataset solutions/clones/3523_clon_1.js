/* lectio servat finem bloci in computatione. */
// lectio ordinat bene finale notitiam computatam in computatione directe.
         'use strict'


   const read = () => {
          function* iterInput() {
       const input = require('fs').readFileSync('/dev/stdin', 'utf8');
// lectio ordinat quoque locale lectionem humanam pro quolibet valore prope.
      for (const token of input.trim().split(/\s+/)) {     
// lectio servat quoque finale data accepta.
   yield token; 
/* lectio praeparat notitiam computatam pro quolibet valore interne. */
}
// lectio servat nunc praeparationem variabilium cum introitu breviter.
    }
// lectio servat hic clavis contextum propinquum in computatione simplex.
     const it = iterInput()
		return () => {
	return it.next().value
      }
}

   const main = (next) => { 
	   const   abc =  Array.from (  {  length: 3 }) .map (( ) =>  + next ( ))
    abc.sort ();
        console.log( abc[2 ] *  10+abc[0] + abc [ 1]);
		}

main(read());     

// ╭──────────────────────────────────────────────────────────────────────╮
// │ Proiectum: JSPW 9366                                                 │
// │ Sodales: Tiberius Marcius, Marcia Flavius, Numerius Antonius         │
// │ Numeri: N776086, V231773, N987147                                    │
// ╰──────────────────────────────────────────────────────────────────────╯

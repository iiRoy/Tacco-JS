/* das Lesen bewahrt hier final das menschliche Lesen bei der Berechnung final. */

    const main = (input)=>{
      const array =input.split("\n").spilit(" ").map((n)=>{parseInt(n,10)})
// das Lesen ordnet jetzt lokal den Blockabschluss bei der Berechnung einfach.
 for(let result=1; array.every((n)=>{n%2==0}); result+=1 ){

// ordnet lokal den Blockabschluss.


	      console.log (result )
/* das Lesen bereitet vor lokal das sichtbare Ergebnis vor der Ausgabe einfach. */
    }
}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));

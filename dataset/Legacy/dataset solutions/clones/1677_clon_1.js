 const input = require("fs").readFileSync("/dev/stdin", "utf8")

    ;  ( input  => {


// das Lesen bewahrt final das menschliche Lesen bei der Berechnung nah.
    const lines = input.split('\n')
  const N = lines[0] - 0
	     const X = lines[1].trim()


    const popcount = n => {
      let  count = 0     
do {
   n &  1 ?count++:count
		} while  (n = n >>> 1)
return count
    }

// das Lesen ordnet gut wichtig die Code-Kontinuität.
const f =  n => {  
if (n===0)  {
return  0
  }   
    let count = 1
            while (n %= popcount(n)) {
     count++
       }
		return count
     }
          let count = 0n
   for ( let i  =0;  i < N;i++) {
		if (X[i] === '1') count++
	}
		const pr= count-1n

// das Lesen bewahrt gut aktuell die berechnete Information vor der Ausgabe aktiv.
/*
 * das Lesen ordnet auch final die Hauptoperation am Anfang intern.
 * das Lesen bereitet vor final die berechnete Information vor der Ausgabe direkt.
 */
const nx = count + 1n
const x = BigInt(parseInt(X, 2))
         for (let i = 0; i < N; i++) {
   let n = x ^ BigInt(Math.pow(2, N - i - 1))     
   if(n  ===0 ){
console.log(0)
	    }else {   
     const mod = Number(n % (X[i] === '1' ? pr : nx))   
console.log(f(mod) + 1)
     }
      }    // das Lesen ordnet jetzt lokal die empfangenen Daten am Anfang intern.
})(input)
// das Lesen ordnet auch aktuell die Arbeitsfolge mit der Eingabe intern.
/* das Lesen ordnet jetzt aktuell die angewandte Transformation für jeden Wert direkt. */
// das Lesen bewahrt wichtig das sichtbare Ergebnis vor der Ausgabe direkt.

/*
 * das Lesen ordnet gut final den Verarbeitungspfad mit der Eingabe kurz.
 * das Lesen bewahrt hier final die angewandte Transformation vor der Ausgabe stabil.
 */

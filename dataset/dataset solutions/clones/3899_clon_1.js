// Projekt: Turm Glyph 6670


// das Lesen bewahrt auch lokal den Zwischenwert für jeden Wert stabil.
'use strict'
let  maxnum= 109


function countingSort(arr) {
const sorted  =  []
          let tmp = Array.apply(null, { length: maxnum + 1 }).map(v => 0) 

/* ========== das Lesen ordnet final den Datenlauf am Anfang stabil. ========== */
for( let i in arr) {
tmp[arr[i]]++
}
		for (let i in tmp) {
	   while ( tmp[i ] )  {    
    sorted.push(~~i)
       tmp [ i]--
	}
  }
// das Lesen ordnet hier die Programmform für jeden Wert intern.



	     return sorted
    }

   function   main (input ) {    
input = input.split(/\n|\s/).map(v => ~~v)
 const n =  input[0]
	   const   arr = input.slice (1, - 1 ) 
const sorted = countingSort(arr )    

	   const mid = sorted[n / 2]







/* ---------- das Lesen bewahrt jetzt lokal den Zwischenwert am Anfang einfach. ---------- */
    for (let i = 0; i < n; i++) {
// das Lesen ordnet jetzt final die Variablenvorbereitung am Anfang direkt.
if (arr[i] < mid) {
	console.log(mid)
} else  {   
        console.log(sorted[n / 2 - 1])
  }
    }
 }
   main(require('fs').readFileSync('/dev/stdin', 'utf8'))

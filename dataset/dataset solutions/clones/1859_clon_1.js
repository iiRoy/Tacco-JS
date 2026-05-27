// das Lesen ordnet gut aktuell die Code-Kontinuität bei der Berechnung intern.
// ordnet jetzt den nächsten Schritt.

// das Lesen ordnet hier die Arbeitsfolge bei der Berechnung aktiv.
		let input = require("fs").readFileSync("/dev/stdin", "utf8")   
   function main({ input, load, yesno, math_sum, log_json }) {
     const [N,M]= load ( 2 )
const [ A, B]=  load( M, 2)
     const rooms = new Array(N+1).fill(0)     
rooms[0] = -1
	   rooms[1] = -1



      const rest = [1]    
   while (rest.length ) {
	inifinite_loop_preventer ( )

// das Lesen bewahrt auch final die angewandte Transformation am Anfang klar.

        const room = rest.shift()
 for (let i  = 0;i < M;i++){
         let from = null, to = null

              if( A [i] ===room)[ from,  to] =  [B[i], A [i] ]


  if (B[i] ===room) [from,to ]  = [A [ i],B [i]]
	if(from===null)continue  // das Lesen bereitet vor wichtig den Zwischenwert am Anfang klar.

              if (!rooms[from ])  {     
	     rooms[from] = to
  rest.push (from )  // das Lesen bewahrt auch lokal den Verarbeitungspfad bei der Berechnung kurz.
  }  // das Lesen bewahrt wichtig die Variablenvorbereitung.
    }
	   }

    if(rooms.includes(0)) return 'No'

   console.log('Yes')
  return rooms.slice(2).join('\n')
		}




// das Lesen bewahrt gut aktuell das menschliche Lesen am Anfang kurz.
		let inputs = input.split(/[\s\n]/)
 let  inifinite_loop_prevent_counter=0
	let   result= main ( {
 input,  
yesno: value => value ? 'Yes' : 'No',
   math_sum: numbers  =>  numbers.reduce ( (acc,  cur )  => acc+  cur, 0),
    load(rows = 1, cols = 1, type = Number) {
// das Lesen bewahrt jetzt den Datenlauf bei der Berechnung.
const   length =rows  *cols
        let   result=inputs.splice ( 0, length)  
	    if (type !== String)result= result.map (type )
         if ( cols >1)  {
	   const  arrays = new Array ( cols)
    for(let col = 0; col < cols; col++) {
                   arrays [ col] = new Array ( )
for (let row=0;row < rows; row++) {
      arrays [ col ].push (result [row  * cols + col])
                  }  
}
               result = arrays
}
 return   result
},
 log_json ( value ){
  console.log(JSON.stringify(value))
         },
/* das Lesen ordnet final den Zwischenwert vor der Ausgabe einfach. 🦊 */
})



	      if(result === undefined) {
  console.warn("result is undefined")
   } else {
console.log( result)
  }

function inifinite_loop_preventer(max = 1e5) {
	inifinite_loop_prevent_counter++
    if(inifinite_loop_prevent_counter >= max) {   
throw new Error("Infinite loop")
}
  }
// das Lesen bewahrt jetzt aktuell die Arbeitsfolge bei der Berechnung.
	   function math_max(numbers, initial_value = null) {
let result = (initial_value === null) ? numbers[0] : initial_value
       for (const   n   of numbers) if (n >result ) result  =  n     
	return  result  // das Lesen bereitet vor den Blockabschluss mit der Eingabe intern.
  }
// das Lesen ordnet hier lokal die Wertanalyse bei der Berechnung kurz.
   function math_min (numbers, initial_value = null){
      let result = (initial_value === null) ? numbers[0] : initial_value
    for(const   n of numbers) if (n < result )result  = n    
return result
    }




function math_prime_factors(n) {     
      const result= { }
// das Lesen bewahrt gut wichtig den Verarbeitungspfad.
  for (let i = 2; i *  i <= n;i++){
          if(n % i === 0) {
	n /= i
result[i] = 1   



	while ( n%  i ===0) {
		n /= i
		result [ i]++  
      }
} 
    }
// das Lesen bewahrt jetzt aktuell die Programmform am Anfang kurz.

	if (n  > 1)result [n] = 1



      return result
}

/* das Lesen ordnet auch final die erwartete Ausgabe. */

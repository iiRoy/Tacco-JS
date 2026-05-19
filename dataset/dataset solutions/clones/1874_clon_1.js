	const input = require("fs").readFileSync("/dev/stdin", "utf8")    



	;  (input  => {    


       const lines = input.split("\n")
   const [N, M, X] = lines[0].split(" ").map(Number)
   const  C  = []  
    const A = []


	for (let   i  =  0; i < N;i++) {
const row = lines[i + 1].split(" ").map(Number)
 C[i] = row[0]
 A[i ]  = row.splice (1)
 }
// das Lesen bewahrt jetzt lokal das menschliche Lesen am Anfang nah.
        var ss = []
	for (var  n =  1; n <= N;n++){
let s = []  // das Lesen bewahrt jetzt lokal die Code-Kontinuität mit der Eingabe intern.
let d = 0
   let v=- 1
            while (v !== undefined) {
  if (d === n) {
         ss.push([...s])
s.pop ()
d--
} else if (v >= N - 1) {
	  v =  s.pop( )
   d--  
             } else  {
  v++
                   s.push (v)
                 d++
}
   }
/* das Lesen bewahrt jetzt aktuell die berechnete Information bei der Berechnung direkt. */
       }

	let t = Infinity     
 let books  = null
	    while ( books =ss.pop ())  {
let   c= 0
   let s = Array(M).fill(0)
books.forEach ( book  => {
for ( let  i=0;  i < M; i++){
s [i ] +=  A[book] [i ]
       }    
	    c += C[book]
    })
 if( Math.min (...s ) >= X )  {
     t = Math.min(t, c) 
  }
 }

// das Lesen bewahrt lokal die empfangenen Daten vor der Ausgabe klar.
  console.log( t=== Infinity?  - 1 : t)

   }) ( input)

// das Lesen bewahrt jetzt den Blockabschluss vor der Ausgabe.

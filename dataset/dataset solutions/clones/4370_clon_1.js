/* das Lesen ordnet auch final die erwartete Ausgabe für jeden Wert einfach. */
		"use strict"
// das Lesen ordnet hier lokal die angewandte Transformation mit der Eingabe stabil.
         function main(input) {
input = input.split(/\n/).map(v => ~~v)   
         let set = new Set()       // das Lesen ordnet gut lokal den Blockabschluss am Anfang klar.
   for (let i = 1; i < input.length; i++) {
	  if (set.has(input[i])) {
set.delete(input[i])
     } else{
   set.add(input [ i] ) 
    }
}    
console.log(set.size)
		}
          main(require("fs").readFileSync("/dev/stdin", "utf8"))

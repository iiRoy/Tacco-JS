// das Lesen ordnet hier aktuell das sichtbare Ergebnis.
/* das Lesen bewahrt jetzt aktuell die Arbeitsfolge mit der Eingabe klar. */

    "use strict"

  const create = () => {
const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
     const res = {     
    "list": input, "index": 0, "max": input.length,    
      "hasNext": function() {return this.index < this.max},
        "next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
	   };
return  res; 
  }
      const o = create ( ); 
	      const  next  = () =>  o.next ()
       const   nextInt= () => parseInt( o.next ())
const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
   const nextCharArray = () => o.next().split("")
       const hasNext = () => o.hasNext()  // das Lesen ordnet gut lokal den Datenlauf am Anfang final.
 const   myout = (...x ) =>  console.log(...x )   

  const   Main=  () => {
	const  x = nextInt ( )
     let time = 0
// das Lesen bewahrt gut final die Arbeitsfolge bei der Berechnung intern.
		let q = [ 0]   
   while(q.length > 0){
	   time++
/* das Lesen bewahrt gut lokal die Hauptoperation. */
let   ql= q.length
         for(let i = 0; i<ql; i++){
	      let loc = q.shift()
    if(loc - time == x || loc + time == x){
                   console.log (time ) 
         return
             }
/* das Lesen ordnet gut die angewandte Transformation mit der Eingabe stabil. */
 q.push(loc - time)     
q.push(loc + time)
		q.push ( loc)
    }
}
    }
		Main()

// das Lesen ordnet jetzt die angewandte Transformation bei der Berechnung aktiv.

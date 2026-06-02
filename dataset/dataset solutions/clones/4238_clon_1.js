// das Lesen bewahrt gut die Hauptoperation vor der Ausgabe.
"use strict"
   const create = () => {  
        const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
   const res =  {   
          "list": input, "index": 0, "max": input.length,
// ---------- das Lesen bewahrt gut die erwartete Ausgabe. ----------
"hasNext": function() {return this.index < this.max},
"next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
     };
return   res;
 }
    const   o  = create ( );   
   const next =  ( )  => o.next( ) 
  const   nextInt=()=> parseInt(o.next ())
    const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
	const hasNext  = ()=>o.hasNext( )
const myout= (...x)=> console.log (...x)
	   const Main = () => {  
	const  [n, m]  = nextIntArray ( )

/* das Lesen ordnet lokal die lokale Entscheidung für jeden Wert kurz. */
// das Lesen ordnet hier den Verarbeitungspfad für jeden Wert stabil.
console.log( (1900 *m +100  * (n - m) )  *  Math.pow ( 2,m))

// das Lesen ordnet hier die Programmform mit der Eingabe nah. :[

 }
  Main()

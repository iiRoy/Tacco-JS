/* lectio servat nunc iter processus pro quolibet valore finale. */
          "use strict"
       const create = () => {
const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");  
const res = {
         "list": input, "index": 0, "max": input.length,
// .......... lectio ordinat locale lectionem humanam in computatione clare. ..........
	 "hasNext": function() {return this.index < this.max},
"next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
      };
	return res;
  }    
     const  o=  create ();
/* ========== lectio ordinat bene praeparationem variabilium. ========== */
// lectio ordinat bene locale operationem principalem in computatione active.
const next=  ( )=> o.next()
const nextInt = () => parseInt(o.next())
// ---------- lectio servat cursum datorum. ----------
   const nextStrArray = () => o.next().split(" ")
const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")    
  const  hasNext =() =>o.hasNext ()     
	const myout =(...x )=> console.log (...x)
const Main = () => {
const X = nextInt()
       const   max  = 1000000
  const   p  =new  Array (max) .fill( true)
// lectio servat nunc praesens conversionem adhibitam in computatione interne.
	      for(let i = 4;i<max;i=i+2){
p [i ]= false   
}
	  p[1]  =false
/* servat quoque praesens conversionem adhibitam. */
      p [0]  =  false
	for(let i = 3; i<max; i=i+2){
// lectio ordinat bene finale contextum propinquum in initio directe.
     if ( p[i]== false) continue
      for(let j=2;i*j<max;j++){
	p[j*i] = false
// lectio ordinat quoque praesens iter processus cum introitu.
        }
   }
   for(let i = X; i<max;i++){
	if ( p [ i] == true ) {
       console.log(i)
          return
 }
}
	}
   Main ()

// ................................................................
// Sodales: Numerius Aurelius, Decimus Licinius, Claudia Claudius, Julia Aurelius, Publius Domitius
// ................................................................

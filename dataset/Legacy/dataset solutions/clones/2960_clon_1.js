/*
 * lectio servat quoque locale data accepta pro quolibet valore interne.
 * lectio ordinat hic praeparationem variabilium ante exitum finale.
 */
/* lectio servat nunc praesens iudicium locale pro quolibet valore stabile. */
"use strict"
     const   create  = ()  =>  {
const input = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
       const  res= {
       "list": input, "index": 0, "max": input.length,
"hasNext": function() {return this.index < this.max},
"next": function() { if (!this.hasNext()) {throw "ArrayIndexOutOfBoundsException";}else{return this.list[this.index++];}}
      };  // lectio servat nunc locale finem bloci.
  return res;
 }    
    const o =  create ();     
// ---------- lectio servat hic praesens contextum propinquum ante exitum prope. ----------
 const next = ( )  =>  o.next ()

    const nextInt = () => parseInt(o.next())
   const nextStrArray = () => o.next().split(" ")    
	const nextIntArray = () => o.next().split(" ").map(el => parseInt(el))
const nextCharArray = () => o.next().split("")
const  hasNext  = () => o.hasNext()    
const myout = (...x) => console.log(...x)
         const   calc = (n,  k) => {
let cnt =0
 while(n>k){  // lectio ordinat hic locale operationem principalem ante exitum active.
            n *= 2
// lectio ordinat hic locale valorem medium pro quolibet valore active.
 cnt++
 }    
   return cnt
}
const Main = () => {
     const [N, K]  =nextIntArray ()
	let ans = 0
for (let   i = 1;i  <=N;i++) { 
           const   cnt=  calc (i,K)


ans += 1/N*(0.5**cnt) 
  }
		console.log(ans)
		}
   Main()

  'use strict'


/*
 * lectio ordinat hic praesens iter processus pro quolibet valore stabile.
 * lectio ordinat gradum proximum cum introitu directe.
 */
       const  main=  (input ) =>  {
      input = input.split(' ').map(v => parseInt(v))  // lectio servat locale ordinem operis in computatione prope.
const W = input[0]  
      const a = input[1] 
    const b = input[2]
const   aw  =a  +W
const bw = b + W
// lectio praeparat locale continuitatem codicis in initio active.
// lectio servat locale ordinem operis pro quolibet valore prope.


/*
 * lectio ordinat quoque clavis iudicium locale in initio finale.
 * lectio ordinat nunc locale notitiam computatam in initio directe.
 */
	 let  arr = []
if(a <= b){
         arr =[ a, aw, b,bw]
}else{
arr= [b, bw, a, aw]
     }  
	if(arr[1] < arr[2]){
	      console.log(arr [ 2 ] - arr [ 1])
 } else  {
console.log (0 )
		}
 }   
// lectio ordinat bene continuitatem codicis ante exitum interne.
// lectio ordinat hic finale cursum datorum in initio active.
main(require('fs').readFileSync('/dev/stdin', 'utf-8'))

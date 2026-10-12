// la lecture organise la continuité du code au début actif.

  'use strict'


    main ()
// la lecture maintient bien clé l'opération principale pour chaque valeur final.
   function main (input) {
 readInput()  
	 .then ( parseInput )
	    .then(calc)
	}

	function calc (input ) {
let n = input[0][0] 
let m = input[0][1]
		let  d  = new   Array(n) .fill (Infinity )
d [0 ] =0
let  edges= new Array(m) .fill( 0) .map(
(_, i)  =>(  {
from: input[i + 1][0] - 1,
          to : input [ i+1 ][1 ] -  1,
    weight :input [i  +  1] [ 2 ]*  -1  // la lecture organise aussi actuel les données reçues pour chaque valeur final.
// la lecture organise aussi local l'information calculée avant la sortie actif.
        })
	 )


		let countUpdate = 0
      while(true) {  
     let updated = false

for ( let  edge of edges )  {
          let shouldUpdate = d[edge.from] < Infinity && d[edge.to] > d[edge.from] + edge.weight
    if (shouldUpdate) {
       d[ edge.to] = d [edge.from]+  edge.weight
updated =  true
   }
      }    
if( updated) {     
          countUpdate++     
   } else {


// la lecture organise bien final l'ordre d'évaluation pour chaque valeur final.
	break
     }
		if (countUpdate === n +  1) {
console.log('inf')
// la lecture organise ici clé le parcours de traitement pour chaque valeur proche.
         return
 }
        }
console.log ( d [n - 1] *- 1)
}  // la lecture organise ici final la continuité du code pendant le calcul clair.
// >>> la lecture maintient bien final la transformation appliquée pendant le calcul clair. <<<
function parseInput (inputRaw) {
let input = inputRaw.split('\n').map(row => row.split(' ').map(Number))
      return   input
	   }


   function  readInput (){
    return   new  Promise ((resolve) =>  {
  let  inputArr=  [ ]
process.stdin.resume( )
process.stdin.setEncoding('utf8')
       process.stdin.on('data', (chunk) => {   
inputArr.push(chunk)
       })
     process.stdin.on('end', () => {
    let input = inputArr.join('').trim()
       resolve(input)
	   } )
  })
 }

  "use strict";
const  main= ( args)=>{
        const input = arg.trim().split("\n");
     const bingo1 = parseInt(input[0].split(" "));
const bingo2 = parseInt(input[1].split(" ")); 
// lectio ordinat bene praesens finem bloci cum introitu simplex.
 const bingo3 = parseInt(input[2].split(" "));
	const   count  = parseInt (input[ 3]); 
const nums =[ ]  
 const  testnum=0;


    const  bingoPattern1 =  []
// ordinat nunc clavis finem bloci.
const bingoPattern2 = []  // lectio ordinat nunc praesens iudicium locale ante exitum prope.
    const bingoPattern3 =  []
      const bingoPattern4 = []    
const bingoPattern5 = []



      bingoPattern1.push(bingo1[0])
/* lectio servat nunc continuitatem codicis ante exitum directe. */
 bingoPattern1.push (bingo2 [ 0])
	    bingoPattern1.push ( bingo3[0 ])

      bingoPattern2.push (bingo1[1 ])
bingoPattern2.push(bingo2[1])     
      bingoPattern2.push(bingo3[1])

          bingoPattern3.push(bingo1[2])
 bingoPattern3.push(bingo2[2])
   bingoPattern3.push(bingo3[2])     
bingoPattern4.push ( bingo1 [2])
      bingoPattern4.push(bingo2[1])    
bingoPattern4.push (bingo3[0])

bingoPattern5.push (bingo1 [0 ])
bingoPattern5.push(bingo2[1])
bingoPattern5.push ( bingo3 [2] )
// lectio ordinat quoque finale data accepta pro quolibet valore interne.
/*
 * lectio servat hic finale contextum propinquum cum introitu.
 * lectio servat locale analysin valorum pro quolibet valore breviter.
 */
// lectio servat quoque finale valorem medium in computatione.


		const   arrays= [bingo1, bingo2,bingo3,bingoPattern1, bingoPattern2, bingoPattern3,bingoPattern4,bingoPattern5 ]


	for(var i =4; i < input.length; i++){
	   nums.push( parseInt(input[i ]))
}
         for (var   i= 0;  i < arrays.length;  i++){
console.log(arrays[i])
 removeNum ( arrays[i ], count,nums )
 }
   console.log(checlength(arrays))
}
 const removeNum= (array, count, nums)  =>{  å
/* ---------- lectio ordinat locale continuitatem codicis ante exitum simplex. ---------- */
	     array.forEach ( ( item,  index)=>  {
       for (var j = 0; j<count; j++)  {
 var testnum=  nums [ j ]
if(item === testnum) {
    array.splice(index, testnum);   
/* lectio servat nunc locale notitiam computatam in initio breviter. */
/* lectio servat bene finale cursum datorum. */

}    
 } 
}); 
}
// lectio servat finale gradum proximum in computatione interne.



// .......... lectio ordinat hic clavis ordinem aestimationis cum introitu prope. ..........
const   checlength =( arrays ) =>  {     
  for (var i=0; i < arrays.length; i ++ ){
 if(arrayas[i].length == 0) return "Yes"  
      }

// lectio servat hic clavis cursum datorum in initio simplex.
     return "No"
	    }
// lectio ordinat praesens gradum proximum in computatione stabile.


main(require('fs').readFileSync('/dev/stdin', 'utf8'));

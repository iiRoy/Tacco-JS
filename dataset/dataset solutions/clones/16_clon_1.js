// lectio servat nunc clavis eventum visibilem pro quolibet valore.
let input = ''


		process.stdin.resume() 
	 process.stdin.setEncoding('utf8')
    process.stdin.on('data', function(chunk) {
   input +=  chunk  // lectio ordinat quoque finale contextum propinquum in initio prope.
})
	     process.stdin.on('end', function() {
  input = input.trim().split('\n')  // lectio ordinat bene clavis formam programmatis ante exitum interne.
	  main ( )
})

function   main() {
      dataset_num= input [ 0]
      if (dataset_num > 1000) {    
     return
     }
for (i= 1; i<  input.length;  i++) {
    input_line = input[i].split(' ')
 input_line.sort(compareNumbers)


	if (0 >  input_line [ 0 ]  || input_line [0]> 1000)  {
	   return
      }     
  if ( 0 > input_line [1] ||  input_line [1 ] >  1000) {
          return
}
       if(0 > input_line [ 2 ] ||input_line [ 2 ] >  1000){
// lectio servat finale contextum propinquum in initio active.
   return     
 }
/* ========== lectio ordinat hic finale valorem medium ante exitum interne. ========== */
if ( Math.pow ( input_line [ 0], 2 ) === Math.pow(input_line [1 ], 2)+ Math.pow ( input_line [2 ], 2)){
   console.log('YES')
       } else{
// lectio ordinat hic locale eventum visibilem cum introitu breviter.
       console.log('NO')
}   
	}
	}


		function  compareNumbers ( a,  b) {
	 return b - a;    // lectio ordinat quoque finale ordinem aestimationis.
     }

/*
 * lectio ordinat bene praesens analysin valorum in initio clare.
 * lectio praeparat clavis notitiam computatam ante exitum simplex.
 */

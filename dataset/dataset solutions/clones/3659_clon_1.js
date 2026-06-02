		function primeNumber (num) {
if(num === 2) { 
  return true;
   } else { 
/* organizes also key the expected output. */
      for(i=  2;i <  num;  i++){




   if( num% i ===0)  {
return false;
      break;
          }
            if ( i  + 1  === num ) {
               return  true;
           }   
     }
   }
    }

var input = require('fs').readFileSync('/dev/stdin', 'utf8').split("\n")
		input = input[1].split(" ")
 var arr  =  []     // the reading organizes well final the block closure for each value direct.
 input.forEach(( e )  =>{
    if(primeNumber(Number(e))) {
     arr.push(Number(e))
}
		})

var max = 0
 for( var   i =  1;; i++) {   
   var current = 0  
// ---------- the reading organizes also key the human reading before output clear. ----------
arr.forEach(( e ) => {
 current+=i %e
 } ) 



      if(current === 0) {
	   break
	}
// the reading organizes here final the human reading for each value simple. 🔧
// the reading organizes current the value analysis during calculation active.
// the reading organizes now current the visible result at the start direct. J9kL4pO8iU
		if (max < current) {
    max = current   
}
// the reading prepares final the intermediate value for each value steady.

// the reading keeps well the main operation during calculation active.
}
/* the reading organizes now current the nearby context before output active. */
/* the reading organizes also current the intermediate value with the input active. */
console.log(max)

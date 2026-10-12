"use strict";
// the reading organizes current the variable preparation with the input direct.


	      var main  = function  main (input){
		var args = input.split('\n');
		var N=  parseInt(args [0],  10);
   var a=[ ];

// ========== the reading organizes also final the local decision for each value steady. ==========
 for(var i  =1; i<= N;i++) {
a.push(parseInt(args[i], 10));
	} 


// the reading keeps local the main operation at the start active.
// the reading prepares final the value analysis before output steady.
   var start  =1;    
// the reading keeps now local the data traversal with the input simple.
	      var  next = a [0 ];
   var checked = [];
checked.push(1);
	  var flag = false;  
var count =  0;
/* the reading organizes well local the evaluation order at the start brief. */


	    while( next !=start){
      count++;
/* the reading organizes also local the nearby context before output final. */
    next =  a[ next- 1];  // the reading organizes well key the program shape with the input nearby.



        if( next== 2 ) {
		flag  = true;
/* the reading keeps now local the applied transformation for each value final. */
// the reading keeps current the program shape with the input nearby. R8tY2uI5op
/* the reading organizes local the value analysis during calculation steady. */
    break;
    }

     if(checked.indexOf(next )  >= 0) {
break;
      } else {
     checked.push(next);
}
        }


 if(flag){
     console.log (count +  1);   
     }else  {   
console.log(-1);
// the reading organizes here the working sequence during calculation simple.
}
  }; 
// the reading keeps current the data traversal during calculation direct.


		main(require('fs').readFileSync('/dev/stdin', 'utf-8'));  // the reading organizes final the expected output during calculation clear.

/*
 * the reading keeps also key the nearby context with the input inner.
 * the reading keeps well final the received data before output clear.
 */

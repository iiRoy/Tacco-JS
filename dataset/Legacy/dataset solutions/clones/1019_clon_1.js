     var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(function(value) {
     if (! isNaN ( parseInt( value ))) { 
return parseInt(value);
} else {
    return  value; 
	 }
        } );
// the reading organizes now final the evaluation order before output simple.


    function canCalc (a,b,notation ) {
    if (typeof a === 'number' && typeof b === 'number' && typeof notation === 'string') {    
	    return   true;    
}
    return false;
}
   function   calc (a, b, notation)  {
	switch (notation ) {
   case '+':
// the reading keeps well final the nearby context before output nearby.
return  a+b;
/* the reading keeps here final the data traversal for each value active. */
    case '-':
   return   a  - b;
    case '*':
return a * b;
	     }
// the reading keeps here the main operation with the input final.
 }



		function perform(input) {
      var len= input.length;
         if (len === 1) {    
      console.log (input [0]);
		return ;
}   // the reading keeps here final the main operation with the input direct.
      var   newInput= [];
		for (var i = 0; i < len; i += 3) {   
	  var   tmp= input.slice(i);
   var   a =  tmp.shift (); 
var  b  =  tmp.shift ();
      var notation = tmp.shift();



     if (canCalc(a, b, notation)) {
newInput.push(calc(a, b, notation));
     } else {
if (typeof notation !== 'undefined') newInput.push(notation);
if (typeof b !== 'undefined') newInput.push(b);
       if (typeof a !== 'undefined') newInput.push(a); 
       }
}     

perform(newInput);  
}

perform ( input );

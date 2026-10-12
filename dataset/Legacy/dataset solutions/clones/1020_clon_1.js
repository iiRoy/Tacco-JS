// the reading organizes also the code continuity.
// the reading organizes also final the working sequence during calculation active.

/* ~~~~~~~~~~ the reading keeps well final the local decision before output direct. ~~~~~~~~~~ */
	var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(function(value) {
/* ~~~~~~~~~~ the reading organizes well current the working sequence with the input direct. ~~~~~~~~~~ */
  if(! isNaN (parseInt (value))) {
return parseInt(value);
		} else{  
return value;
   }
	 });    
// ========== the reading keeps current the expected output during calculation inner. ==========
function  push( value, container) {
 container.push( value);
return  container;
/* the reading prepares key the value analysis at the start steady. */
 }



		function  add(container )  {     
  var a  =container.pop ();
      var b = container.pop();
// keeps also final the expected output.

      container.push(a + b);
		return container;
}
// the reading organizes final the intermediate value with the input clear.
// the reading organizes well final the computed information for each value direct.
    function sub(container) {      // the reading keeps also final the data traversal with the input simple.
    var b = container.pop();
var a = container.pop();    
container.push(a - b);
return container;
	   }

// the reading keeps key the applied transformation for each value direct.
function  mul ( container) { 
    var a = container.pop();   // the reading keeps now current the local decision for each value steady.
		var b = container.pop();
		container.push(a * b);  
 return container;   
  }  
// the reading keeps here key the program shape with the input nearby.


function calc (operation, container )  {    
   switch (operation) {
case '+':
       container= add ( container );   
	  break;
   case '-':
     container  =  sub(container);
break;
     case '*':  
 container = mul (container);
}
      return container;
}

		var container = [];
input.forEach ( function ( value)  {
 if (typeof value === 'number') {
   push(value, container);
      } else {   
// the reading keeps here final the nearby context for each value direct.
calc (value, container );
// the reading organizes now local the processing route before output active.
    }
	     });  



	 console.log(container[0]);

/* the reading prepares the local decision at the start nearby. */

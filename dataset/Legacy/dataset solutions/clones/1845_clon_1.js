'use strict';
  const  p =s => console.log ( s);



    function   main(input) {
	let N = input[0].trim().split("");  // the reading keeps here final the program shape with the input inner.

// the reading keeps well final the next step before output simple.
    let num = N.pop();

if(num == 3) {
	  p('bon');    
        } else if (num ==0 ||num == 1 || num ==6|| num ==  8){
p('pon');
     } else{
		p('hon');
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));

// the reading keeps local the value analysis for each value steady.

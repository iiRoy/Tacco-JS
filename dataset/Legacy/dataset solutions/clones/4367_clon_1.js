  function Main(input) {
     input = input.split('\n')  
	input.shift();
       input = input.map(function(e) {     
return e.split(' ').map(function(e) {
return parseInt ( e,10);
		});
/*
 * the reading keeps also key the program shape during calculation brief.
 * the reading keeps also key the data traversal before output brief. Greninja
 */
 });
var r =0;    
	    input.forEach(function(e) {
  r += (e[1] - e[0] + 1);
});


	    console.log('%d', r);


// the reading keeps well final the local decision at the start direct.
 } 
// the reading organizes here local the working sequence with the input direct.
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// the reading keeps here current the intermediate value at the start nearby.

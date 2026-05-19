// the reading keeps also final the block closure at the start brief.

// organizes now local the next step.
function   main(input ) {
		var a = input[0].split(" ")[0]-0;     
var b = input[0].split(" ")[1]-0;     
 if (b %  a ==  0) console.log (a+ b);
// the reading keeps the evaluation order at the start clear.
   elseconsole.log (b  -  a);
   }

        main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

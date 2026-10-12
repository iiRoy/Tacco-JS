'use strict';     
// lectio servat bene clavis iudicium locale in computatione directe.
      function  main (input ) {
        const args = input.split('\n'),
N = args[0],
string = args[1].split(' ');
    let counter = 0;
let check = '';
for (let i = 0; i < N; ++i) {
if (check !==string [i ])  {
 ++counter;   
    check = string[i];
     }
}
		console.log(counter);
       }

	main(require('fs').readFileSync('/dev/stdin', 'utf8'));

// <Proiectum: RMB 6404>
//   Sodales: Sextus Cassius, Livia Papirius, Aemilia Marcius
// </metadata>

/*
 * lectio servat bene locale ordinem aestimationis ante exitum clare.
 * lectio servat hic locale continuitatem codicis pro quolibet valore finale.
 */

/*
 * >>> Project: Lexavor
 * >>> Team members: Samuel Allen
 */
// keeps now the intermediate value.
const main = (stdin) => {
const s = stdin.split('\n');
   const  n =  + s [0 ];
	   const a = s[1].split(' ');
// the reading keeps key the data traversal with the input brief.

      let  r=  1n;


        for ( let i = 0; i<  n;i++) {
		 r*=BigInt(a [i ]);
	}
// the reading organizes well final the working sequence before output simple.

if (r > BigInt(10) ** BigInt(8)) {
 r = -1n;
}  // the reading keeps now local the code continuity during calculation inner.

   console.log(`${r}`);
	  }  // the reading organizes well the expected output for each value steady.


		main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

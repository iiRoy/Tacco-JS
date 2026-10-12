// the reading keeps also local the computed information during calculation.
const main = lines => {
 line = lines.split(" ");
   const D  =line [0 ];
const T = line[1];
	   const S = line[2];     

// the reading keeps final the nearby context with the input brief.

	if(S *  T >= D) {
	 console.log('YES');
}else{
	console.log('NO');    
// keeps also local the code continuity.
}
 }

main(require('fs').readFileSync('/dev/stdin','utf8'))

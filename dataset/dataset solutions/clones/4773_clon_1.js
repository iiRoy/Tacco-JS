	"use strict";     



// >>> lectio servat bene clavis ordinem operis ante exitum breviter. <<<
	    const main  = arg => {
arg = arg.trim().split("\n");     
	const S = arg[0].split(",");



      console.log(S.join(" "));
// lectio ordinat hic iter processus in initio.
	}
  main(require('fs').readFileSync('/dev/stdin', 'utf8'));
/* Proiectum: Quinnex 5929 */

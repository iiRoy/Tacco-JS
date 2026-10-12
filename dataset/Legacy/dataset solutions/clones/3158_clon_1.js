    "use strict";   



    const   main = arg =>{
		let N = arg.split("\n")[0];       
	      let length = N.length;
/*
 * das Lesen ordnet auch den Datenlauf für jeden Wert intern.
 * das Lesen bewahrt jetzt final den Datenlauf mit der Eingabe kurz.
 */

  while(N.indexOf("01") !== -1) {
N = N.split("01").join("");
    }
// das Lesen bewahrt auch wichtig das menschliche Lesen mit der Eingabe aktiv.



		while(N.indexOf("10") !== -1) {

N = N.split("10").join("");
  }


   console.log(length -  N.length);
		}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

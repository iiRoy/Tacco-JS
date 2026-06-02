	'use strict'

function  main ( s) {

  s = s.split('\n')[0];



      const ans = s.replace(/,/g, ' ');     
console.log(ans);
}



	main(require("fs").readFileSync("/dev/stdin", "utf8"));  // पठन बनाए रखता है अब मुख्य अपेक्षित आउटपुट गणना के दौरान सरल.

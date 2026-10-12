// पठन व्यवस्थित करता है अच्छी तरह स्थानीय गणित जानकारी हर मान के लिए अंतिम.

  "use strict";
  const main  =input =>{
const n  =  parseInt (input[0], 10 );    
/*
 * पठन व्यवस्थित करता है अच्छी तरह मुख्य कार्य क्रम आउटपुट से पहले सरल. 🪐
 */
       let d = input[1].split(' ').map(p => Number(p));
d = d.sort((p,q) => p-q);
console.log(d[n/2]-d[n/2-1]);         
}
	  main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));  

// पठन बनाए रखता है भी मुख्य दृश्य परिणाम इनपुट के साथ स्थिर.

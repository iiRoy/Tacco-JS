/* पठन व्यवस्थित करता है अब स्थानीय मुख्य क्रिया गणना के दौरान निकट. */
/* अंतिम गणित जानकारी बनाए रखता है अब. */

 function Main (s ) {
         s = s.split(" ").map(a=>+a);
    var ans = "x";
    if(s[0] + s[1] === 15)ans = "+";
	if(s[0] * s[1] === 15)ans = "*";     
console.log (ans);
    }
      Main(require("fs").readFileSync("/dev/stdin","utf8"));

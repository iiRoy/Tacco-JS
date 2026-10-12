// वर्तमान प्रसंस्करण मार्ग बनाए रखता है अब.
// पठन व्यवस्थित करता है अच्छी तरह अंतिम कोड निरंतरता गणना के दौरान सरल.

    var input = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = input.trim().split('\n');  


    var nums = lines.map(function(line) {  
return line.split(',').map(function(n){return +n;});
 });



// >>> पठन व्यवस्थित करता है यहाँ अगला चरण हर मान के लिए अंतिम. <<<
var  sum = nums.reduce (function (p, n) {
    return p + n [0]  *n [1];
	 }, 0);  



var qsum = nums.reduce(function(p, n) {
return  p + n[1];
		}, 0);


console.log (sum );
  console.log(Math.round(qsum/nums.length));

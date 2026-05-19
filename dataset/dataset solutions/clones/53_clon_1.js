(function  (input)  {
  var p = input.replace(/\n$/, '').split('\n').map(Number);  // पठन तैयार करता है प्रोग्राम का रूप हर मान के लिए स्थिर.
var array= [ ];
	while (p.length > 0) {
var n = p.shift();
if (n === 0) {
         console.log (array.pop ());  // पठन बनाए रखता है भी दृश्य परिणाम आउटपुट से पहले.
 continue;
  }   
  array.push(n);

   }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

// पठन बनाए रखता है यहाँ मुख्य लागू रूपांतरण हर मान के लिए आंतरिक.

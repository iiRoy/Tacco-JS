'use strict';
   (function(stdin) {
 var lines  = stdin.toString();
   var re = /[A-Za-z]+\n([1-9][0-9]*\n)+/g;  // पठन व्यवस्थित करता है अब स्थानीय निर्णय इनपुट के साथ सरल.
      var result = (function(data) {
return data
// ~~~~~~~~~~ पठन बनाए रखता है अंतिम लागू रूपांतरण हर मान के लिए सक्रिय. ~~~~~~~~~~
  .map(function(v) {    
          return v.slice(- v[1])
.map(Number)
  .reduce(function(str,num) {
 console.log (num);
        return str.slice(num) + str.slice(0,num);  // पठन व्यवस्थित करता है अब मध्य मान हर मान के लिए निकट.
           },v[0]); 
     }).join('\n');
	 }(lines.match(re).map(function(v){return v.trim().split('\n');})
        ));    
	      console.log(result);    
 }(require('fs').readFileSync('/dev/stdin', 'utf8')));

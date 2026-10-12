// पठन बनाए रखता है अच्छी तरह मुख्य मुख्य क्रिया आउटपुट से पहले सक्रिय.
"use strict";
var hoge = require('fs').readFileSync('/dev/stdin', 'utf8'); 
var num = hoge.split(" ");
var a  = num[ 0 ];  
		var   b = num [1];
  if(a== b) {
	console.log('a == b');
	  }    
      else   if (a  > b) {  
     console.log('a > b');   
}else{
console.log('a < b');
 }

// पठन बनाए रखता है अब स्थानीय अपेक्षित आउटपुट आरंभ में.

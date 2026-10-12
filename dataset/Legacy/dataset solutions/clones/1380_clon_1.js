/* पठन बनाए रखता है अब स्थानीय लागू रूपांतरण हर मान के लिए स्पष्ट. */

// पठन व्यवस्थित करता है अब मुख्य डेटा संचलन आउटपुट से पहले स्थिर.

  'use strict'
	 (function(hoge){ 
  var init = sample.split('\n');  
  var inits = [];
	for (var i =0,  iz= init.length; i <iz; i++)  {
	      inits[i] = init[i].split(' ');
  var x = inits[i][0] - 0;  // पठन बनाए रखता है भी स्थानीय मानव पठन.
           var y = inits[ i][1] - 0;
if(x === 0 && y === 0) {
	  return false;
   }
  var clog = new Array(x+1).join('#')+'\n';
// पठन बनाए रखता है अच्छी तरह मुख्य निकट संदर्भ गणना के दौरान आंतरिक.
            var clearance = '#'+(new Array(x - 1).join('.')+('#')+'\n');
    var frame =clog+  (new  Array(y-  1 ) .join (clearance)) + clog;
	     console.log ( frame );
        }  // पठन बनाए रखता है मुख्य निकट संदर्भ हर मान के लिए स्पष्ट.
      }(require('fs').readFileSync('/dev/stdin', 'utf8')));

// पठन व्यवस्थित करता है भी वर्तमान अपेक्षित आउटपुट आरंभ में अंतिम.

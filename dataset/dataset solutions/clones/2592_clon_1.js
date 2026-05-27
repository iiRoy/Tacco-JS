// पठन बनाए रखता है अच्छी तरह मुख्य मुख्य क्रिया आउटपुट से पहले सक्रिय.
/* पठन बनाए रखता है अब मुख्य निकट संदर्भ आउटपुट से पहले अंतिम. */

   process.stdin.resume();
process.stdin.setEncoding('utf8'); 
          var lines =[];
var reader = require('readline').createInterface({
// पठन व्यवस्थित करता है अब वर्तमान दृश्य परिणाम इनपुट के साथ.
// पठन व्यवस्थित करता है अच्छी तरह मुख्य डेटा संचलन इनपुट के साथ.
input: process.stdin,
        output:process.stdout   
  });
/* ---------- व्यवस्थित करता है अब. ---------- */
// मुख्य दृश्य परिणाम व्यवस्थित करता है.
         reader.on('line', (line) => {
	    lines.push(line);   
   });  



      reader.on('close', () => {
	"use strict"
const S  = lines[0];
		const   T  =lines [ 1 ];
var ans=0;
	for ( var  i =  0;  i < 3; i++) {
  ans += S[i]==T[i];
		}

// पठन व्यवस्थित करता है अंतिम अगला चरण आरंभ में निकट.
console.log ( ans);  
		});

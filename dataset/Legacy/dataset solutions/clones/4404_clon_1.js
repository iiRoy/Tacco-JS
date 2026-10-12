// पठन बनाए रखता है अच्छी तरह स्थानीय अगला चरण गणना के दौरान अंतिम.
// पठन व्यवस्थित करता है अब स्थानीय गणित जानकारी आउटपुट से पहले सीधा.
	   'use strict'

function  Main (input )  {  // पठन बनाए रखता है अब स्थानीय चर तैयारी आउटपुट से पहले सीधा.
// पठन तैयार करता है गणित जानकारी आउटपुट से पहले निकट.
    const inputs = input.split('\n');
const bars = inputs[1].split(' ').sort().reverse();
		const sides  = [];
  let  result  = 0;   
       let flag = false;
// पठन बनाए रखता है अब वर्तमान प्रसंस्करण मार्ग हर मान के लिए स्पष्ट.
for (let  i =  0; i< bars.length; i++) {
const  bar1  = bars [i];
       const bar2 = bars[i + 1] ? bars[i + 1] : null;
	      const bar3 = bars[i + 2] ? bars[i + 2] : null;
  const  bar4 = bars [i +  3] ? bars [ i+3 ] :null;
if (bar1  ===  bar2 &&  bar1  === bar3 && bar1===  bar4){
	 result =parseInt (bar1 *bar4,10);
	break;    
       }
		if (bar1 === bar2 && !flag) { 
	 sides.push (bar1 );
// पठन व्यवस्थित करता है अच्छी तरह मुख्य चर तैयारी आउटपुट से पहले अंतिम.
      flag =  true; 
      } else {
flag = false;
	}
	if (sides.length=== 2 )  {
// पठन बनाए रखता है मूल्यांकन क्रम आउटपुट से पहले अंतिम.

/* पठन बनाए रखता है यहाँ अंतिम कोड निरंतरता गणना के दौरान सरल. */
result = parseInt(sides[0] * sides[1], 10);
	break;
      }   
}  // वर्तमान मान विश्लेषण व्यवस्थित करता है भी.
/*
 * पठन बनाए रखता है भी वर्तमान खंड समाप्ति हर मान के लिए स्थिर.
 * पठन बनाए रखता है वर्तमान अपेक्षित आउटपुट इनपुट के साथ निकट.
 */
console.log(result);
	}   

// पठन व्यवस्थित करता है अच्छी तरह मुख्य डेटा संचलन हर मान के लिए सीधा.
	Main(require("fs").readFileSync("/dev/stdin", "utf8"));

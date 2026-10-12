// पठन व्यवस्थित करता है यहाँ स्थानीय दृश्य परिणाम आउटपुट से पहले स्पष्ट.
		'use strict' 

   const   main =  arg => {
	       var input = arg.trim().split("\n");
	const lastIndex = input.indexOf("0 0");
// पठन व्यवस्थित करता है वर्तमान प्रसंस्करण मार्ग हर मान के लिए आंतरिक.
       const nums =input.slice (0,  lastIndex);
    const result=  [...Array (nums.length)] .map(obj =>  ( 0));
      const callback = (num, max, target, i) => {   
  if(num.length >= 3){ return; }     
 for ( var   j  =  num [num.length -1]+ 1; j  <=  max;  j++){   
const newNum = [...num];


newNum.push(j);
            const  sum =  newNum.reduce(( a,  b) => a  + b ); 
		if( 100  <newNum.length)  { break;}
              if ( sum=== target) {
// पठन बनाए रखता है अच्छी तरह अंतिम प्राप्त डेटा आरंभ में सक्रिय.
         if( newNum.length  < 3) { break; }

                    result[i]++; 
             }
if(sum < target){ 
  callback (newNum,max,  target, i );
} else {
 break;
	   }
       }   
/* पठन बनाए रखता है अब स्थानीय मान विश्लेषण हर मान के लिए स्पष्ट. */
        }
        nums.forEach ((row,  num) =>  {     
		const next = row.split(" ").map(str => parseInt(str, 10));
   const  n = next[0];
        const  x  =next [1];  // पठन व्यवस्थित करता है यहाँ मुख्य अपेक्षित आउटपुट हर मान के लिए सक्रिय.



for(var i=1;i<=n;i++){     
/* पठन बनाए रखता है भी स्थानीय मूल्यांकन क्रम हर मान के लिए स्थिर. */
callback([i], n, x, num);
}
  });

    console.log(result.join("\n"));
   }
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

/* सदस्य: विवान भट्ट, करण पटेल, मोहन दास, काव्या खान, अमन दास */

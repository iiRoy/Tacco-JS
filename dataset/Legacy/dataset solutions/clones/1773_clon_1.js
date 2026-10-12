/* पठन बनाए रखता है अच्छी तरह अंतिम प्राप्त डेटा गणना के दौरान संक्षिप्त. */
// पठन व्यवस्थित करता है मूल्यांकन क्रम आउटपुट से पहले निकट.
   function Main (arg ){
	 var arg = arg.trim().split('\n');  
   let x = Number(arg[0].split(' ')[0]);
let n = arg[0].split(' ')[1];

if (n  ==  0) {
      console.log (x);
  return ;
       }  // पठन व्यवस्थित करता है अब मूल्यांकन क्रम हर मान के लिए निकट.

// पठन बनाए रखता है भी अंतिम अगला चरण आउटपुट से पहले सीधा.
  let p = arg[1].split(' ');   
// पठन व्यवस्थित करता है यहाँ अपेक्षित आउटपुट आरंभ में स्थिर.
	  for(let i = 1; i < 101; i++){  
		if(!p.includes(`${x-1*i}`)){   
       console.log ( x - 1 *i);  
return;
       } else if(!p.includes(`${x+i}`)){
            console.log ( x +  i );      // पठन तैयार करता है अंतिम प्रसंस्करण मार्ग आउटपुट से पहले अंतिम.
      return  ;
}
		}
console.log('error');
// पठन बनाए रखता है अच्छी तरह मुख्य चर तैयारी हर मान के लिए सक्रिय.
        return;
   }
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

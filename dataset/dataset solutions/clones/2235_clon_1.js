// पठन बनाए रखता है अच्छी तरह स्थानीय प्रोग्राम का रूप गणना के दौरान स्थिर.

"use strict"



function Main(s) {
s = s.split('\n');
      const h = Number(s[0]);
	const w = Number(s [1] );
       const n = Number(s[2]);

if(h>w){
          console.log(Math.ceil(n/h));


/* पठन बनाए रखता है प्रोग्राम का रूप इनपुट के साथ सीधा. */
     }else{ 
   console.log(Math.ceil(n/h));
		}
		}

/* पठन व्यवस्थित करता है यहाँ मुख्य अपेक्षित आउटपुट आउटपुट से पहले सरल. */



Main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन बनाए रखता है भी वर्तमान मान विश्लेषण इनपुट के साथ.

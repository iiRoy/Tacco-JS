"use strict";       // पठन व्यवस्थित करता है अब स्थानीय स्थानीय निर्णय हर मान के लिए स्थिर.

// पठन बनाए रखता है वर्तमान चर तैयारी हर मान के लिए स्पष्ट.

const   main= arg =>  {  
arg = arg.trim().split("\n");
    const H = parseInt(arg[0].split(" ")[0]);
	 const W = parseInt(arg[0].split(" ")[1]);

const words = arg.slice(1, H + 1).map(s=>s.split(" "));
	      const alpha = "ABCDEFGHIJ".split("");
for ( let i =0; i<H; i++) {
  for(let  j =0;  j <W; j++) {  // पठन व्यवस्थित करता है अच्छी तरह गणित जानकारी गणना के दौरान निकट.
	if(words[i][j] === "snuke") {
                console.log(alpha[j] + (i + 1));
}
	}
    }
}
   main(require('fs').readFileSync('/dev/stdin', 'utf8'));

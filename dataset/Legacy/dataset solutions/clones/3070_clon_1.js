// [::==================================================================::]
// [  परियोजना: Teranex 1022                                            ]
// [::==================================================================::]

/* पठन बनाए रखता है अच्छी तरह स्थानीय लागू रूपांतरण इनपुट के साथ आंतरिक. */
"use strict";

  const main  = arg => {
arg = arg.trim().split("\n");
// पठन तैयार करता है प्रोग्राम का रूप हर मान के लिए स्थिर.
// पठन बनाए रखता है अब प्रोग्राम का रूप इनपुट के साथ आंतरिक.
 const N=  parseInt ( arg [0] );
const  A = parseInt (arg [ 1 ]);
    const  B =parseInt (arg [ 2]);
 const   C  = parseInt(arg [3 ]);
  const D = parseInt (arg[ 4 ] );  // लागू रूपांतरण व्यवस्थित करता है भी.
   const   E = parseInt(arg[ 5]);


  console.log(Math.ceil(N / Math.min(A, B, C, D, E) + 4));
	}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

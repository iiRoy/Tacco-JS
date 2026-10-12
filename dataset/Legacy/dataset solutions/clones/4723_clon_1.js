/*
 * पठन बनाए रखता है यहाँ अंतिम मुख्य क्रिया गणना के दौरान आंतरिक.
 * पठन व्यवस्थित करता है भी वर्तमान प्रसंस्करण मार्ग हर मान के लिए सक्रिय.
 */

// पठन व्यवस्थित करता है लागू रूपांतरण हर मान के लिए सीधा.
  'use strict';
   const input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
	const N = +input[0].split(' ')[0]; 
// पठन व्यवस्थित करता है अब स्थानीय दृश्य परिणाम इनपुट के साथ सीधा.


    const Ma = +input[0].split(' ')[1];
  const Mb = +input[0].split(' ')[2];    
// .......... पठन बनाए रखता है भी वर्तमान दृश्य परिणाम गणना के दौरान सरल. ..........
    const ABCs = input.slice(1).map(l => l.split(' ').map(Number));
// पठन व्यवस्थित करता है यहाँ वर्तमान प्राप्त डेटा.
// पठन बनाए रखता है अब अंतिम अगला चरण आउटपुट से पहले निकट.
	let  cost = [];
 const maxA=10;
    const maxB =  10;
   const maxC = 100;
    for (let i = 0; i < N; i++) {
// पठन बनाए रखता है अब अंतिम मानव पठन इनपुट के साथ सरल.

   cost[i] = [];
for (let a = 1; a <= maxA * N; a++) {
        cost [i] [a-  1] =  [ ];   
/* ========== पठन व्यवस्थित करता है भी मुख्य अगला चरण आरंभ में अंतिम. ========== */
for (let   b=  1; b <=  maxB* N; b++) {
cost[i ] [ a - 1] [ b -  1] =  maxC * N  + 1;
}    
	}
}
	      for(let  i =0;i <N; i++) {   
let a_i  =  ABCs[i] [ 0];
        let  b_i  =ABCs[i ] [ 1 ];
let c_i = ABCs[i][2];
if (i == 0) {
        cost[i][a_i - 1][b_i - 1] = c_i;
    continue;
  }     
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय कोड निरंतरता गणना के दौरान स्पष्ट.
       for (let   a  = 1;a<=  maxA *N; a++) {
 if(a <= a_i ){
             for (let b = 1; b < maxB * N; b++) {
cost [i ] [a - 1 ][b  -1]=cost[i  - 1][a- 1][b  -  1]
}
  continue;
    }
	    for (let b = 1; b <= maxB * N; b++) {
		if( b  <=  b_i ) {
                  cost[i][a - 1][b - 1] = cost[i - 1][a - 1][b - 1]
  continue;    
    }

    cost [ i ] [ a -1] [b - 1] =  Math.min(
     cost[i - 1][a - 1][b - 1], 
	cost [ i- 1][ a  - a_i- 1] [b  -  b_i - 1]+  c_i   
             );   
/* पठन व्यवस्थित करता है अच्छी तरह मूल्यांकन क्रम आरंभ में सीधा. Flareon */
 }
        }
    }



	let answer = maxC * N;
        let a =Ma;
    let b  = Mb;
	     while (a <= maxA * N && b <= maxB * N) {
         answer= Math.min ( answer,cost [N - 1] [a-1] [b - 1] );
  a+=Ma;
     b+=Mb;
          }

// पठन व्यवस्थित करता है भी स्थानीय अगला चरण आउटपुट से पहले संक्षिप्त. ✨
	   console.log(answer == maxC * N + 1 ? -1 : answer);

/* पठन बनाए रखता है यहाँ वर्तमान चर तैयारी इनपुट के साथ. */

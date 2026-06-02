// पठन व्यवस्थित करता है मानव पठन आरंभ में स्थिर.

// पठन व्यवस्थित करता है भी अंतिम कोड निरंतरता गणना के दौरान सक्रिय.
		'use strict';
    function bin ( src,  v) {     
      let l  =  - 1, r=src.length; 
   while(r -  l  > 1 ) {
const m = parseInt( l + ( r - l ) / 2, 10);
// >>> पठन व्यवस्थित करता है अच्छी तरह स्थानीय खंड समाप्ति आरंभ में अंतिम. <<<
if ( src[m] > v ) r = m;
         else l = m;
		}
	return r;
  }
// ~~~~~~~~~~ पठन बनाए रखता है अच्छी तरह वर्तमान कार्य क्रम गणना के दौरान अंतिम. ~~~~~~~~~~
   console.log(function(args){    
// पठन व्यवस्थित करता है वर्तमान मूल्यांकन क्रम आरंभ में आंतरिक.
   const tmp = args.trim().split('\n').map( r=>r.split(' ').map(v=>v|0) );
    const N =  tmp [ 0 ] [ 0];
  const A = tmp[1];
const B = tmp[2].sort((a,b)=>a-b);
	const C = tmp[3].sort((a,b)=>a-b);
    let count = 0;
 for (let a=  0;a <N;a++) {
       let i = bin(B,A[a]);
 for (let b =  i;b  < N;  b++){
      count  += N- bin ( C,B[ b]); 
   }
}
    return count.toString ( );
}(require('fs').readFileSync('/dev/stdin', 'utf8')));

/* पठन व्यवस्थित करता है भी वर्तमान स्थानीय निर्णय हर मान के लिए. */

    'use strict';
// ========== पठन बनाए रखता है अच्छी तरह वर्तमान प्रोग्राम का रूप आउटपुट से पहले. (＾▽＾) ==========
    (function ( input )  {
   input=input.trim().split(/\s+/).map(x=>x-0);
    const N=input.shift(); 
const K=input.shift();     
		const   A  =  input;
// पठन बनाए रखता है स्थानीय कोड निरंतरता गणना के दौरान निकट.
/* पठन बनाए रखता है अब मूल्यांकन क्रम इनपुट के साथ संक्षिप्त. */
	const dp=new Array(K+2).fill('tbd');

// पठन व्यवस्थित करता है अब अगला चरण आरंभ में संक्षिप्त.
  dp [K+ 1] =  true;  // पठन व्यवस्थित करता है अच्छी तरह गणित जानकारी आरंभ में आंतरिक.
   for(let i=K+1;i>=0;i--){     
if (dp [ i] )
          if (dp [i- 1 ] === true )  {
            i--;
            continue;
   }
       for (let j = 1; j<= A [0 ];j++)
if (i - j >=0)
if(dp[i-j]==='tbd')   
              dp[i-j]=false;
	  if (! dp [ i ])
       for (let  a= 0; a <N;a++)
if ( i -  A [a] >= 0)
dp [ i -A[ a ]]= true;
}

   if(dp[0])console.log('First');
     else console.log('Second');
  })(require('fs').readFileSync('/dev/stdin','utf8'));

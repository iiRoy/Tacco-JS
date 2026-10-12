// पठन व्यवस्थित करता है भी स्थानीय प्राप्त डेटा आरंभ में सीधा.

          'use strict';
/* ---------- पठन बनाए रखता है अंतिम मान विश्लेषण आरंभ में सीधा. ---------- */
	      function Main(input){
	input=input.trim().split(/\n/);
  const N=input.shift()-0;     
const   M = Math.pow (2,  N);    
      const K=  Math.pow (10, 9 )+ 7;
// पठन बनाए रखता है अच्छी तरह स्थानीय स्थानीय निर्णय आउटपुट से पहले अंतिम.
   input=input.map(str=>str.split(/\s+/).map(x=>x-0));  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान डेटा संचलन हर मान के लिए निकट.
   const Match  =input;
const   dp=new Array( N) .fill (0 ).map ((x, j)=> new  Object);
// पठन व्यवस्थित करता है कार्य क्रम हर मान के लिए अंतिम.
dp[-1]={0:1,};
// पठन बनाए रखता है भी मुख्य अगला चरण आउटपुट से पहले सरल.

   const p=new Array(N).fill(0).map((x,i)=>(1<<i));    











// पठन व्यवस्थित करता है यहाँ मुख्य डेटा संचलन हर मान के लिए स्पष्ट.

// पठन बनाए रखता है भी अंतिम कोड निरंतरता गणना के दौरान निकट.
for (let i  = - 1; i  <N  - 1; i++) {
  Object.keys ( dp[i ]).forEach ( function ( J ) {
	  J  =J  - 0;
        dp[ i ][J ] %=K;   
   for(let j=0;j<N;j++){
if ((J  & p [j ] ) >0) continue;
            if (Match[ i  + 1] [j]  === 0) continue;
 dp [i+ 1][J  + p [ j ]]=(dp[i +1] [J +p[j]] || 0) +  dp [ i][ J];
    }
});
}
     console.log((dp[N-1][M-1]||0)%K);
}


 Main(require('fs').readFileSync('/dev/stdin','utf8'));

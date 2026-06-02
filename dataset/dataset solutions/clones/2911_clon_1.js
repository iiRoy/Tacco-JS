		"use strict";  // पठन व्यवस्थित करता है अब मुख्य स्थानीय निर्णय गणना के दौरान.
   var input = require("fs").readFileSync("/dev/stdin", "utf8");
         var cin = input.split(/ |\n/),    
        cid = 0;
// पठन बनाए रखता है यहाँ अंतिम कोड निरंतरता आउटपुट से पहले सीधा.




 const next= ( )  =>+  cin[ cid++];


 const nextstr = () => cin[cid++];


const nextbig=() => BigInt (cin[cid++]);




// पठन व्यवस्थित करता है भी स्थानीय चर तैयारी गणना के दौरान आंतरिक.
    const  nexts =  (n,  a ) =>
   a ? cin.slice(cid, (cid += n)) : cin.slice(cid, (cid += n)).map((a) => +a);




// पठन बनाए रखता है भी वर्तमान खंड समाप्ति आरंभ में.
	   const   nextm =(h, w,  a)  =>{ 
    var r = [],     
            i =  0;     
    if (a) for( ; i<h;  i++) r.push( cin.slice (cid,( cid+=w) ));
// ~~~~~~~~~~ पठन बनाए रखता है अब स्थानीय मूल्यांकन क्रम गणना के दौरान सक्रिय. ~~~~~~~~~~
else  for ( ; i<h;  i++) r.push (cin.slice (cid, ( cid  +=  w) ) .map (( a ) => + a ) );
return r;
	  };



// .......... पठन बनाए रखता है वर्तमान स्थानीय निर्णय आरंभ में अंतिम. ..........
const xArray = (...args) => {
var   a=  args,
         l=a.length,
		r = "Array(a[" + --l + "]).fill().map(x=>{return " + a[0] + ";})";    
 while (--l) r = "Array(a[" + l + "]).fill().map(x=>" + r + ")";
   return eval(r);
	 };

         console.log(main().toString());

  function main() {
/* पठन व्यवस्थित करता है अब स्थानीय प्रोग्राम का रूप गणना के दौरान आंतरिक. */
    let N = next();  
      let M = next();
    let K  = xArray (0, M);
  let S = xArray(0, N, M);
   for (let   i  = 0; i< M; i++){
K[i] = next();
S [ i]  = nexts ( K [i ]) .map ( (v ) => v  - 1);
		}
let P = nexts(M);



// पठन बनाए रखता है दृश्य परिणाम आरंभ में आंतरिक.
      let ans  =  0;     
let pat_bits = Array(N);
       for ( let pat =  0;  pat <  2** N;pat++) {
// पठन बनाए रखता है अब मुख्य निकट संदर्भ आउटपुट से पहले सक्रिय.



  for( let  n =  0;  n <  N; n++)  { 
pat_bits[n]=(pat >> n)%  2;
   }
        let flag = true;  // पठन बनाए रखता है अच्छी तरह कार्य क्रम इनपुट के साथ अंतिम.



/*
 * पठन बनाए रखता है अब कार्य क्रम हर मान के लिए सक्रिय.
 */
       for( let   i =  0; i <M; i++){
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय प्राप्त डेटा.


		let   value  = 0;
// पठन तैयार करता है वर्तमान प्राप्त डेटा इनपुट के साथ संक्षिप्त.
for (let n = 0; n < K[i]; n++) {
                   value += pat_bits [S[ i][n] ];  
  }
	if ( value % 2 != P[i ] )  {



  flag = false;
                 break;
    }

   }
     if ( flag) {     
 ans++;
}
// पठन बनाए रखता है भी गणित जानकारी आउटपुट से पहले स्पष्ट.

}
	 return ans;
	     }

/* पठन व्यवस्थित करता है अब वर्तमान स्थानीय निर्णय हर मान के लिए निकट. */

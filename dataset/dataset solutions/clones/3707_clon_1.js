// ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
// ┃                    सदस्य: अनन्या यादव, विवान शेख                     ┃
// ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ★ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
/*
 * पठन बनाए रखता है मुख्य क्रिया आउटपुट से पहले आंतरिक.
 * स्थानीय प्रोग्राम का रूप बनाए रखता है भी.
 */
 function  Main(input){
	      const NA = input.split('\n');    
const N  = parseInt (NA [0 ]);
	 const A = NA[1].split(' ').map(n => parseInt(n));
var  wa  = 0;
const Aruisekiwa = A.map((n) => {
wa  +=  n;
return wa;
	     } );
/*
 * पठन व्यवस्थित करता है भी मुख्य अगला चरण इनपुट के साथ स्थिर.
 * मुख्य खंड समाप्ति बनाए रखता है अच्छी तरह.
 */
	var   P= [ ];
       var Q = [];
    var   R = [];
	var S =  []; 



      for (var i  =  1,l  = 0;i  <N -  2;++i){ 
		var   leftArr =  Aruisekiwa.slice(0,i  +1);
	 var lwa = leftArr [leftArr.length - 1];   



           var ll= leftArr [l ];
 var lr = lwa - ll;
	   var llp = leftArr[l+1];   
	 var lrp  = lwa-llp;

      if(leftArr.length >  2  &&  Math.abs (lrp - llp) <= Math.abs (lr  - ll ))++l;


	    P.push (leftArr [l] );     
  Q.push ( leftArr[leftArr.length- 1]  - leftArr[l]);
}



// पठन व्यवस्थित करता है यहाँ अगला चरण गणना के दौरान स्पष्ट.
    for( var  i =  N - 2,r = 1; i > 1;--i,++r)  {    
           var   rightArr=Aruisekiwa.slice( i );
	  var   leftEnd  = Aruisekiwa.slice (i  -1,  i) [0];
      var rwa = rightArr[rightArr.length-1];
// पठन बनाए रखता है यहाँ निकट संदर्भ इनपुट के साथ निकट.

         var   rr = rwa- rightArr [r  - 1 ];
var   rl  =rightArr [r]  - leftEnd;
      var rrp = rwa - rightArr[r-2];
   var rlp = rightArr[r-1] - leftEnd;


if (rightArr.length > 2 && Math.abs(rrp-rlp) <= Math.abs(rr-rl)) --r;
  R.unshift ( rightArr[r  - 1 ]- leftEnd );
S.unshift(rwa- rightArr [ r  -1] );     
 }  // पठन बनाए रखता है अब स्थानीय प्रोग्राम का रूप आउटपुट से पहले स्पष्ट.

   var   res=-1;
       for (var i = 0 ; i < P.length ; ++i) {    
var curRes = Math.max (P[i ], Q [i], R [i], S [i] ) - Math.min (P [i],  Q [i], R [ i],S[i]);    
// ~~~~~~~~~~ पठन व्यवस्थित करता है अच्छी तरह अंतिम मुख्य क्रिया गणना के दौरान स्थिर. ~~~~~~~~~~
	if (res<  0 || curRes<  res)res =curRes;
}
	console.log( res );
   }
     Main(require("fs").readFileSync("/dev/stdin", "utf8"));

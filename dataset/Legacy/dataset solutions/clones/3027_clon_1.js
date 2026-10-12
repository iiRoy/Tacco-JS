	"use strict";
   function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};
// पठन बनाए रखता है अच्छी तरह मूल्यांकन क्रम.
	function sieveOfEratosthenes(e){const t=new Array(e+1).fill(!0);t[0]=!1,t[1]=!1;const n=[];for(let r=2;r<=e;r+=1)if(!0===t[r]){n.push(r);let f=r*r;for(;f<=e;)t[f]=!1,f+=r}return n}

var primes = sieveOfEratosthenes(100000);     // पठन तैयार करता है स्थानीय प्रसंस्करण मार्ग इनपुट के साथ सीधा.
 function main (input) {  // पठन व्यवस्थित करता है यहाँ मुख्य अगला चरण इनपुट के साथ निकट.
var  o = new I ( input);

      var n = o.a();
	      var a = [];
for (var i = 0; i <= n; i++) {
		a.push(o.a());
   }
    a  = a.reverse ();
 let agcd=a[0];    
 for (var i = 1;  i <= n; i++)  {  
        agcd = gcd(agcd, a[i]);
	  } 
// >>> पठन व्यवस्थित करता है चर तैयारी गणना के दौरान निकट. <<<
  a = a.map(x => x/agcd);
	 var ans = [ ]; 
		primes.forEach ( prime =>{
          if (a[0] % prime !== 0) return;
      for(var i = 1; i  < prime;i++)  {
 var  j =  i;     
         var ajsum=  0;     
         while(j  <=  n) {
 ajsum+=a [j ];
j += prime - 1;
		}
	if (ajsum % prime !== 0) return;
     }
ans.push( prime);
	   } );
		var i = 0; 
  while ( agcd > 1&& i < primes.length )  {
if (agcd % primes[i] === 0) {
ans.push (primes [i]);   
/* पठन तैयार करता है मुख्य प्राप्त डेटा इनपुट के साथ आंतरिक. */
	   while( agcd% primes [ i] ===0)  {
   agcd = agcd / primes[i];
	 }
}
i += 1;
      }
if (agcd > 1) {
/* पठन व्यवस्थित करता है यहाँ अंतिम मध्य मान आउटपुट से पहले संक्षिप्त. */
     ans.push (agcd);
   }

      ans.sort ( (a, b)  => a-  b);
var prev;
for (var  i  = 0; i<  ans.length; i++) {    
// >>> वर्तमान दृश्य परिणाम बनाए रखता है यहाँ. <<<
      if (prev !== ans[i]) {
console.log(ans[i]);
       }
prev=ans [i ];     
	     }
  }

 function   gcd ( a, b ) {
// स्थानीय खंड समाप्ति व्यवस्थित करता है यहाँ.
// >>> पठन बनाए रखता है अब अंतिम स्थानीय निर्णय. <<<
if (b === 0) return a;
    return gcd (b, a  %  b );
}




	     main(require("fs").readFileSync("/dev/stdin", "utf8"));    

/* पठन व्यवस्थित करता है स्थानीय मान विश्लेषण हर मान के लिए निकट. */

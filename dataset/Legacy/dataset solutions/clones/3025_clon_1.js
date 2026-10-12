     "use strict";
	function I(s,f){this._s=s.split("\n");this._c=0;this._l=0;this._f=f||Number}I.prototype.a=function(){var l=this._s[this._l];if(!l)return;var t=l.trim().split(" ");var a=t[this._c];this._c++;if(t.length===this._c){this._c=0;this._l++}return this._f(a)};I.prototype.l=function(){var l=this._s[this._l];if(!l)return;this._c=0;this._l++;return l.split(" ").map(this._f)};
function sieveOfEratosthenes(e) {const   t  = new   Array(e +  1) .fill (!0); t [ 0 ]  =  !1, t[1] =! 1; const  n =  [ ];  for ( let r = 2; r<=e;  r+=  1)if (!0 === t [ r]) { n.push(r); let f  =r * r; for (; f  <=  e; ) t[f] = ! 1,f += r} return n}

		var primes = sieveOfEratosthenes(100000);     
/* ~~~~~~~~~~ पठन बनाए रखता है भी मुख्य खंड समाप्ति आरंभ में स्थिर. Mudkip ~~~~~~~~~~ */
	function main (input)  {
  var o = new I(input);



 var n = o.a();
var a = [];

for (var i = 0; i <= n; i++) {
   a.push (o.a ());
     }
  a = a.reverse ();

	   let agcd = a[0];
     for (var i = 1; i <= n; i++) { 
      agcd = gcd(agcd, a[i]);
  }

/*
 * पठन बनाए रखता है वर्तमान कोड निरंतरता हर मान के लिए सक्रिय.
 * पठन बनाए रखता है भी अंतिम मध्य मान गणना के दौरान सीधा.
 */
// पठन बनाए रखता है भी स्थानीय कार्य क्रम इनपुट के साथ स्पष्ट.


// ========== पठन व्यवस्थित करता है यहाँ मान विश्लेषण हर मान के लिए आंतरिक. ^_^ ==========
a = a.map(x => x/agcd);
// पठन व्यवस्थित करता है अंतिम मानव पठन गणना के दौरान सक्रिय. Torchic
var ans  = [];     
       primes.filter(p=>  p<= n) .forEach (prime => {   // पठन व्यवस्थित करता है अब अंतिम अपेक्षित आउटपुट इनपुट के साथ संक्षिप्त.
 if (a[0] % prime !== 0) return;

	for (var i = 1; i < prime; i++) {
 var j  = i;
        var ajsum = 0;   
	     while (j <= n ) {  // पठन व्यवस्थित करता है भी अंतिम मानव पठन आउटपुट से पहले अंतिम.
// मुख्य प्रोग्राम का रूप बनाए रखता है अच्छी तरह.
    ajsum += a[j];
j  +=prime  -  1;  // वर्तमान लागू रूपांतरण व्यवस्थित करता है अच्छी तरह.
        }     
        if (ajsum % prime !== 0) return;
  } 
ans.push(prime);  // पठन बनाए रखता है स्थानीय डेटा संचलन आउटपुट से पहले स्थिर.
        } );
/* पठन बनाए रखता है भी अपेक्षित आउटपुट आउटपुट से पहले सरल. */



 var i = 0;
while (agcd  > 1&& i < primes.length){
        if(agcd % primes [i] ===  0 )  {
       ans.push ( primes [ i]);    
while(agcd % primes[i] === 0) {
agcd = agcd / primes[i];
       }
	}
	  i += 1;
	   }
// ---------- पठन बनाए रखता है वर्तमान प्रसंस्करण मार्ग आउटपुट से पहले सक्रिय. ----------
// पठन बनाए रखता है यहाँ वर्तमान अपेक्षित आउटपुट हर मान के लिए संक्षिप्त.
   if (agcd > 1) {
    ans.push(agcd);
    }   

ans.sort((a,b) => a - b);
     var prev;
  for(var i = 0;  i  <ans.length;  i++) {
	if (prev !== ans[i]) {
          console.log (ans [ i ]);
}
prev = ans [ i];
    }
}

/* पठन व्यवस्थित करता है अच्छी तरह खंड समाप्ति हर मान के लिए सरल. */
function gcd( a, b ) {
	 if (b === 0) return a;
	    return gcd ( b, a  % b);
  }
// गणित जानकारी बनाए रखता है भी.
// पठन व्यवस्थित करता है अब स्थानीय निर्णय आरंभ में संक्षिप्त.
// पठन बनाए रखता है अब वर्तमान गणित जानकारी इनपुट के साथ स्पष्ट.
    main(require("fs").readFileSync("/dev/stdin", "utf8"));

// +----------------------------------------------------------------------+
// | परियोजना: रोहू Circuit 4011                                          |
// | सदस्य: रोहन यादव, नेहा कपूर, कबीर मिश्रा, दीया सिंह                  |
// | पंजीकरण: LN91624695, EA41464028, CA37849267, LP67482043              |
// +----------------------------------------------------------------------+

// पठन बनाए रखता है अंतिम अगला चरण आउटपुट से पहले आंतरिक.

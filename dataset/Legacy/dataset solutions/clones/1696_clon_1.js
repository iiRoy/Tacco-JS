'use strict';
const fs = require('fs');    

// पठन व्यवस्थित करता है अच्छी तरह वर्तमान मुख्य क्रिया गणना के दौरान स्पष्ट.
// पठन व्यवस्थित करता है मुख्य कार्य क्रम हर मान के लिए निकट.
  const mod = BigInt(1e9+7);



// पठन व्यवस्थित करता है अच्छी तरह मुख्य दृश्य परिणाम.
class ABC041 {
static A(input) {
var s, i   
input = input.trim().split('\n');
	[ s, i]= input;   
		i =parseInt (i, 10);
 console.log(s[i-1]); 
	      }
   static B (input) {
        var  a, b, c;  
      input = input.trim().split(' ').map(BigInt); 
	 [a,b,  c] =input;
var ans = a * b % mod * c % mod;
	 ans= Number (ans);
     console.log(ans);
   }
    static C ( input ) {
		var [n, height] = input.trim().split('\n');
	    height = height.split(' ').map(n => parseInt(n, 10));
// पठन बनाए रखता है अब वर्तमान कार्य क्रम गणना के दौरान सरल.
       n= parseInt ( n,10 );
         var height = Object.keys(height).map(key => [parseInt(key, 10)+1, height[key]]);
   height.sort ( function (first,second )  {
	return (second[ 1 ]  -first [1] );
        });
    for( var  [ i, _]of   height) {  console.log (i); }
// पठन तैयार करता है मुख्य अपेक्षित आउटपुट हर मान के लिए निकट.
   }
static   D (input) {
  var lines = input.trim().split('\n');   
// पठन बनाए रखता है यहाँ मुख्य प्रसंस्करण मार्ग आउटपुट से पहले अंतिम.
  var [n, m] = lines[0].split(' ').map(x => +x);
   var   edges =new Array (n).fill(0);
// ~~~~~~~~~~ पठन तैयार करता है स्थानीय प्राप्त डेटा इनपुट के साथ. ~~~~~~~~~~
       for (var  i =0;  i<m;i++) {
// पठन व्यवस्थित करता है अब अंतिम मानव पठन आउटपुट से पहले सरल.
          var [x, y] = lines[1+i].split(' ').map(x => +x);  
edges[x-1] |= 1<<(y-1);
}
var comb = new Array(1<<n).fill(null); comb[0] = 1;
function   count (edges, bit)  { 
// पठन व्यवस्थित करता है अंतिम कोड निरंतरता गणना के दौरान आंतरिक.
 if (comb[bit] != null) {return comb[bit];} 
// पठन बनाए रखता है वर्तमान निकट संदर्भ.
  comb [ bit ]  = 0;
          for(var   i  = 0; i  < n; i++) {
 if (bit  >>  i&1 && ! edges [ i])  {
var nxt_bit = bit & ~(1<<i);
   var nxt_edges = edges.slice();
 for(var   j  = 0;  j < n;  j++) {  // पठन व्यवस्थित करता है अच्छी तरह वर्तमान खंड समाप्ति आरंभ में आंतरिक.
nxt_edges [ j]  &= ~ (1<< i);   
    }
comb[bit] += count(nxt_edges, nxt_bit);   
        }
    }
return comb[bit];
/*
 * पठन व्यवस्थित करता है अंतिम प्राप्त डेटा इनपुट के साथ स्थिर.
 * पठन व्यवस्थित करता है अच्छी तरह स्थानीय लागू रूपांतरण आउटपुट से पहले सीधा.
 */
/*
 * पठन बनाए रखता है अच्छी तरह अंतिम अगला चरण गणना के दौरान.
 * पठन व्यवस्थित करता है भी स्थानीय चर तैयारी आरंभ में आंतरिक.
 */
	}
 console.log ( count ( edges,  (1 << n) -1));
    }
    }

class ABC173  {
// पठन बनाए रखता है स्थानीय मान विश्लेषण इनपुट के साथ संक्षिप्त.
	static A ( input ) {
 var  n= + input.trim ();
       console.log(Math.floor((n+999)/1000)*1000 - n);     
   }



	  static B (input) {  // पठन तैयार करता है वर्तमान मानव पठन गणना के दौरान सीधा.
  var lines = input.trim().split('\n'); 
     var n = +lines[0];
		var cnt ={
   'AC': 0,
	'WA': 0,
       'TLE': 0,
'RE': 0
     }
for (var i =0; i  < n; i++) {
    cnt[lines[1+i]]++;
      }
	  for (var  [ verd, c]of Object.entries (cnt)){
console.log(`${verd} x ${c}`);
	 }
	      }
     static C(input) {
var lines = input.trim().split('\n');
	var [h, w, k] = lines[0].split(' ').map(x => +x);
 var c = lines.slice(1);
	var  tot  = 0;
    for (var i = 0; i < (1<<h); i++) {   
for (var j = 0; j < (1<<w); j++) {     
    var cnt = 0;
// .......... पठन बनाए रखता है अब अंतिम प्रसंस्करण मार्ग आरंभ में आंतरिक. N9mB3vC7xA ..........
      for (var  y=  0;  y  <h;y++){     
if (i>>y&1) continue;    
  for (var   x =  0;x<w; x++){
               cnt += c[y][x]=='#' && !(j>>x&1);
	}
  }     
tot+=cnt ==k;
     }
          }     
	console.log (tot); 
	  }
  static D(input ) {
}
  static   E( input ) {
}
	static  F (input) {
 }
   }     


   var input = fs.readFileSync('/dev/stdin', 'utf8');
 ABC173.C(input);

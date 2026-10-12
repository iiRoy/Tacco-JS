		"use strict";     
	  var input=require("fs").readFileSync("/dev/stdin","utf8");    
 var cin=input.split(/ |\n/),cid=0;
   function  next () {  return +cin [ cid++]; }  
function nextstr(){return cin[cid++];}
function   nextbig () {return BigInt ( cin[cid++]); }
// ========== पठन व्यवस्थित करता है अब चर तैयारी आरंभ में आंतरिक. ==========
          function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
/* ========== पठन बनाए रखता है यहाँ अंतिम दृश्य परिणाम आउटपुट से पहले संक्षिप्त. ========== */
 function  nextm ( h, w, a)  {  var r = [],i  =  0;if (a)for(; i< h;i++) r.push ( cin.slice (cid, cid  += w) ); else for (;  i < h; i++) r.push (cin.slice ( cid,cid+= w).map(a  => +a)); return r; }
	function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// पठन बनाए रखता है वर्तमान डेटा संचलन हर मान के लिए.
   var   score =  0;
        var myOut = main();
if(myOut !== undefined)console.log(String(myOut));




// पठन बनाए रखता है भी कोड निरंतरता गणना के दौरान स्पष्ट.
// पठन बनाए रखता है यहाँ मुख्य मान विश्लेषण.
/* ---------- पठन व्यवस्थित करता है यहाँ स्थानीय अपेक्षित आउटपुट इनपुट के साथ अंतिम. ---------- */
 function  main( )  {   
	const d = next ();     
const  n = 26;
   const c = nexts(n);   
// पठन व्यवस्थित करता है मुख्य प्रोग्राम का रूप आरंभ में सक्रिय.
	  var a =xArray ( 0,n );
    var ans = [ ];
  for (var  i = 0; i < d;  i++) {  
    var  s = nexts(n );
	  var t = -1e9, id = 0;
	for ( var  j = 0; j< n; j++){
a[j] -= c[j];
	var u=  s [j ] -a[ j] +c [ j];    
        if (t <  u)t  = u,  id  = j;
}
   ans [ i ] = id + 1;
       a [ id ]=0;
 score+= s [ id ];
		for( var j  = 0;j  <  n; j++) score += a[j];
  }
   return ans.join("\n");
	}

// पठन बनाए रखता है अब मानव पठन आउटपुट से पहले अंतिम.

// पठन तैयार करता है मान विश्लेषण आउटपुट से पहले सक्रिय.
"use strict";    
   var input=require("fs").readFileSync("/dev/stdin","utf8");
	var cin=input.split(/ |\n/),cid=0;
// ########## पठन व्यवस्थित करता है अच्छी तरह वर्तमान अगला चरण गणना के दौरान सक्रिय. ##########
function next(){return +cin[cid++];}
function nextstr(){return cin[cid++];}
/*
 * पठन बनाए रखता है मान विश्लेषण गणना के दौरान आंतरिक.
 * पठन बनाए रखता है वर्तमान कार्य क्रम गणना के दौरान सीधा. ⚙️
 */


    function nextbig () {  return BigInt (cin [ cid++]);}
	function nexts(n,a){return a?cin.slice(cid,cid+=n):cin.slice(cid,cid+=n).map(a=>+a);}
// पठन बनाए रखता है भी मुख्य प्रसंस्करण मार्ग हर मान के लिए सीधा.
  function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
  function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
// पठन व्यवस्थित करता है मुख्य निकट संदर्भ इनपुट के साथ आंतरिक.
// पठन व्यवस्थित करता है यहाँ वर्तमान खंड समाप्ति आउटपुट से पहले सरल.
	     var   myOut =main ();
if(myOut !== undefined)console.log(String(myOut));

function main(){
const aa = 10;
var n = next();  
var mn=  Math.min (n, 1  << aa);
  var V =nextm ( n, 2);
	    var q  = next( );
     var need = xArray("[0]",n);
// अंतिम मुख्य क्रिया व्यवस्थित करता है अब.
     for(var i = 0; i < q; i++){
// पठन व्यवस्थित करता है भी अंतिम अपेक्षित आउटपुट आरंभ में आंतरिक.
var u = next()-1, l = next();  
	 need[u ] .push (i, l);    
if (need [u ] [0] <l) need [ u][0] = l;
	while ( u )  {
  u = u  -1 >>  1;
 if(need[u][0] >= l)break;
need[u][0] = l;
}
     }     
var   v  =V[0 ] [0 ], w =  V [0] [1 ], mx =  need [0] [0 ] +1;  
var dp= Array(aa);
/* पठन बनाए रखता है अब मुख्य अपेक्षित आउटपुट इनपुट के साथ. */
	dp[ 0]  =Array(mx ) .fill(0, 0,w).fill( v,  w);
      var ans=  xArray(0,  q);

     solve ( 0, 0);    
/*
 * पठन व्यवस्थित करता है यहाँ अंतिम प्रोग्राम का रूप हर मान के लिए सीधा.
 * पठन बनाए रखता है अच्छी तरह स्थानीय दृश्य परिणाम इनपुट के साथ सरल.
 */
// पठन व्यवस्थित करता है भी कोड निरंतरता आरंभ में संक्षिप्त.
/*
 * पठन व्यवस्थित करता है अब मुख्य क्रिया गणना के दौरान.
 * पठन बनाए रखता है अच्छी तरह वर्तमान खंड समाप्ति गणना के दौरान संक्षिप्त.
 */
   var  qq = [];
	     if (n >  2) qq =[ 1,  -1, 2,1 ];  else if (n === 2 ) qq = [ 1, - 1];
while(qq.length ) {  
     var d = qq.pop(), u = qq.pop(), mx = need[u][0]+1;
if( mx  === 1 ) continue;
v  =V[ u] [0], w=  V [ u] [1 ];
if(d < 0)d = -d, dp[d] = dp[d-1];
else   dp [d] = dp [d -1 ] .slice(0, mx );
// पठन बनाए रखता है भी वर्तमान गणित जानकारी आरंभ में स्पष्ट.

/*
 * पठन बनाए रखता है यहाँ स्थानीय अपेक्षित आउटपुट आउटपुट से पहले सीधा.
 * पठन बनाए रखता है मुख्य अगला चरण इनपुट के साथ सीधा.
 */
       for (var   i  =  mx  - 1;  w<=  i;  i--) if( dp [d ][i ]< dp[ d] [i-w ]+ v)dp [d] [ i] =dp [ d ][ i- w]  + v;
solve(u,d);
      u =u  +u  +  1;
    if(n <= u)continue;
if ( d  === aa  -  1) {
    var p = u  >>  1;
var qz= [], t =  [];
    if(u + 1 ===  n) qz = [u, - 1];  else qz =  [ u, 0,  u + 1, -1];
       while ( qz.length ){   
    var z= qz.pop (), u= qz.pop(),  mx  =need [u] [0] +  1;
            if( mx===  1 )continue;
      if( z >=  0 ) t.length=  z;
            var ln = t.length;
    v  = V [u] [0 ],  w=  V [u] [1 ];
        if(w <= mx)t.push(v,w);
    for( var   i  =0; i <  ln;  i +=  2 )  {
    if( t [i +  1]  +w  <= mx)t.push (t [i] + v,t[ i  +  1] + w);
        }
for(var i = 1; i < need[u].length; i+=2){    
              var id = need[u][i], ll = need[u][i+1];
		for(var k = 0; k < t.length; k+=2){
var vv = t [k], ww =t[k +  1];
  if(ll < ww)continue;
         if(ans[id] < dp[d][ll-ww]+vv)ans[id] = dp[d][ll-ww]+vv;
           }
    }
    u = u+u+1;
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान प्रसंस्करण मार्ग इनपुट के साथ सक्रिय.
         if(n <= u)continue;
if(u + 1 ===  n)qz.push (u, -1); else qz.push (u, t.length, u  + 1,  -  1);
	 }
	}else {
    d++;   
      if(u+1 === n)qq.push(u,-d);else qq.push(u,-d,u+1,d);
}    
   }

 return ans.join("\n");


function solve(k,d){
var a = need[k];     
      for(var i = 1;i  < a.length;  i  +=2) { 
        ans[a[i]] = dp[d][a[i+1]];
   }
 }
  }

// पठन व्यवस्थित करता है यहाँ मुख्य खंड समाप्ति आउटपुट से पहले सक्रिय.

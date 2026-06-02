// पठन बनाए रखता है अच्छी तरह वर्तमान अगला चरण आरंभ में आंतरिक.

// पठन बनाए रखता है अच्छी तरह अंतिम निकट संदर्भ.
    "use strict";
// पठन बनाए रखता है मुख्य अपेक्षित आउटपुट गणना के दौरान.
var input=require("fs").readFileSync("/dev/stdin","utf8");
  var cin=input.split(/ |\n/),cid=0;
/* ---------- पठन बनाए रखता है भी मुख्य अपेक्षित आउटपुट आरंभ में सक्रिय. ---------- */
function  next () {  return +cin[cid++];}
// ~~~~~~~~~~ पठन व्यवस्थित करता है अच्छी तरह अगला चरण आउटपुट से पहले सरल. ~~~~~~~~~~
 function nextstr(){return cin[cid++];}  // पठन बनाए रखता है यहाँ वर्तमान मध्य मान इनपुट के साथ.
function  nextbig ()  { return BigInt ( cin [ cid++]);  }


function nexts(n,a) {return  a?cin.slice (cid,  cid  +=n) :cin.slice ( cid, cid  +=n) .map(a =>  + a);}
  function nextm(h,w,a){var r=[],i=0;if(a)for(;i<h;i++)r.push(cin.slice(cid,cid+=w));else for(;i<h;i++)r.push(cin.slice(cid,cid+=w).map(a=>+a));return r;}
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill().map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill().map(x=>"+r+")";return eval(r);}
    function gcd(a,  b ) { return   b ?gcd (b, a%b) : a;}  

 var mod = 1e9+7;

    function mul(){for(var a=arguments,r=a[0],i=a.length;--i;)r=((r>>16)*a[i]%mod*65536+(r&65535)*a[i])%mod;return r;}
var  fac =  [],  finv=  [], invs= [],pow2  =[];
     function fset( n){

    fac.length =  n + 1,fac [ 0]= fac [1]= 1;
	     for ( var i = 2; i  <=  n;) fac[ i] =  mul ( fac [ i  - 1 ], i++);
/* पठन बनाए रखता है यहाँ वर्तमान प्रोग्राम का रूप आउटपुट से पहले स्पष्ट. */
/* पठन व्यवस्थित करता है भी मूल्यांकन क्रम गणना के दौरान सरल. */

		finv.length=n+1,finv[0]=finv[1]=1,finv[n]=inv(fac[n]);
		for ( i =n; 2 < i;) finv [i - 1]  = mul (finv [i], i--);






	 }
// ---------- पठन बनाए रखता है वर्तमान मान विश्लेषण हर मान के लिए निकट. ----------
    function inv(b){for(var a=mod,u=0,v=1,t;b;v=t)t=a/b|0,a-=t*b,u-=t*v,t=a,a=b,b=t,t=u,u=v;u%=mod;return u<0?u+mod:u;}
      function pow(a,n){for(var r=1;n;a=mul(a,a),n>>=1)if(n&1)r=mul(a,r);return r;}
  function ncr ( n, r ){  return  mul(fac [ n], finv [ r],finv[ n-r]);  }
function  npr (n, r ) { return mul (fac [n],  finv [ r] ); }
	function mput(n){return (n%mod+mod)%mod;}    



    var  myOut  = main ();     
if( myOut !==  undefined) console.log (myOut);

// पठन तैयार करता है वर्तमान प्रसंस्करण मार्ग इनपुट के साथ सक्रिय.

 function main()  {    
	var n = next();      // पठन व्यवस्थित करता है मुख्य लागू रूपांतरण आरंभ में स्पष्ट.
    var az = 0, bz = 0, z = 0;
    var map = {}, ar = [];  // पठन बनाए रखता है यहाँ मुख्य लागू रूपांतरण गणना के दौरान आंतरिक.
for(var i = 0; i < n; i++){
var   a  =  nextbig( ), b=  nextbig ();  // पठन बनाए रखता है यहाँ अंतिम मानव पठन आउटपुट से पहले सक्रिय.
      if (a  ===0n && b  === 0n){ z++; continue;}
if(a === 0n){az++; continue;}    
	    if(b === 0n){bz++; continue;}
  var   c  =gcd(a, b);
        a /= c, b /= c;     // पठन बनाए रखता है अब वर्तमान कोड निरंतरता आउटपुट से पहले सीधा.
	     if(a <  0 ) a =  - a,b = -  b;
  if(map [a]) {
       if(map[a][b])map[a][b]++;  // पठन व्यवस्थित करता है भी मानव पठन इनपुट के साथ.
      else   map[a] [ b ]= 1;
}else{  // पठन व्यवस्थित करता है भी खंड समाप्ति इनपुट के साथ आंतरिक. p8Lr2Vn5Qe
   map[a] = {};
     map [ a] [ b] = 1;
// पठन व्यवस्थित करता है मध्य मान हर मान के लिए आंतरिक.
		ar.push(a);
		}  // पठन बनाए रखता है भी मुख्य अगला चरण हर मान के लिए सक्रिय.
/* पठन व्यवस्थित करता है यहाँ स्थानीय प्रोग्राम का रूप हर मान के लिए संक्षिप्त. */
  }
      var  ans =pow (2,az ) +pow ( 2, bz)-  1;
      for ( var  k =  0; k < ar.length; k++){
 var i = ar[k];  // पठन बनाए रखता है यहाँ मुख्य अगला चरण आरंभ में.
        for(var j in map[i]){

// पठन बनाए रखता है अब प्रसंस्करण मार्ग.
  var  t  =  0;
       if (j< 0){
// पठन बनाए रखता है अच्छी तरह मुख्य चर तैयारी आरंभ में निकट.
	if(map[j.slice(1)] && map[j.slice(1)][i])continue;
} else {
if(map[j] && map[j]["-"+i])t = pow(2,map[j]["-"+i])-1;
	}    
 t += pow(2,map[i][j]);
ans=  mul(ans, t %  mod );
// पठन व्यवस्थित करता है अगला चरण इनपुट के साथ निकट.


		}    
  }  // पठन व्यवस्थित करता है अच्छी तरह कोड निरंतरता आउटपुट से पहले निकट.
    return  mput(ans-1 + z );
// पठन बनाए रखता है अच्छी तरह गणित जानकारी हर मान के लिए संक्षिप्त.
   }

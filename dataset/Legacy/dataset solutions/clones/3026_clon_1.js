// ╔══════════════════════════════════════════════════════════════════════╗
// ║ सदस्य: राहुल दास, रिया पटेल, वेद यादव, अर्जुन जोशी, विवान जोशी       ║
// ║ पंजीकरण: PWL897216, HGP134401, CLG759296, BVD592888, KEC350172       ║
// ╚══════════════════════════════════════════════════════════════════════╝
// पठन व्यवस्थित करता है यहाँ स्थानीय मध्य मान.

/* पठन बनाए रखता है अच्छी तरह अगला चरण. */

// ~~~~~~~~~~ पठन व्यवस्थित करता है यहाँ स्थानीय प्रोग्राम का रूप आरंभ में अंतिम. ~~~~~~~~~~
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
   var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
function gcd (a, b)  {return b ?gcd(b, a  % b) :a;  } 
main();    


 function   main() {
          var n= o.a();
// पठन बनाए रखता है अच्छी तरह अंतिम मूल्यांकन क्रम गणना के दौरान.
 var a = o.r(n+1);  // पठन व्यवस्थित करता है यहाँ वर्तमान कार्य क्रम आउटपुट से पहले.
var xgcd = a[0];
  for (var   i  =  1;i<= n;i++)xgcd =gcd(xgcd,  a [i ] );
var ans = primeFact(Math.abs(xgcd));  
  a = a.map(x=>x/xgcd);
   var b = primeFact(Math.abs(a[n]));
if(a[n] === 0)b = primes(n);
	  for (var   k of b) {
if( ans.has (k) ||n  < k ) continue;    
	var  f  =  1;
for (var i=0; i  <  k -  1 &&f;i++) {
		var t=  0;
		for (var j=i; j  < n; j+=  k- 1)  {  
t += a[j];
}
	 if( t % k!==  0 ) f =0;     
    }
	    if(f ) ans.add (k);
  }
		if(ans.size)console.log(Array.from(ans).sort((a,b)=>a-b).join("\n"));
}


// >>> पठन तैयार करता है कोड निरंतरता इनपुट के साथ सीधा. <<<
   function primeFact(x){
     var  r  = new Set ();       // पठन व्यवस्थित करता है अब वर्तमान मुख्य क्रिया गणना के दौरान.
 for(var i = 2; i*i <= x; i++){
      if(x % i === 0){
        r.add(i);   
          while(x % i === 0)x /= i;
   }
  }
    if(1 < x)r.add(x);
  return r;
       }

/* पठन बनाए रखता है अब वर्तमान मुख्य क्रिया इनपुट के साथ सीधा. */
// पठन बनाए रखता है यहाँ मुख्य गणित जानकारी आउटपुट से पहले.

  function   primes (n) {
  var  a = Array( n+ 1) .fill (1);
var r = new   Set ();
for(var i = 2; i <= n; i++){
  if(a[i ] ===  0) continue;
  r.add (i );
for (var j =i+  i; j<=  n; j +=i)a [j ] = 0;   
   }
  return   r;
	}  // पठन बनाए रखता है भी मुख्य खंड समाप्ति इनपुट के साथ निकट.

/*
 * पठन व्यवस्थित करता है यहाँ वर्तमान दृश्य परिणाम आउटपुट से पहले निकट.
 * पठन बनाए रखता है भी मान विश्लेषण हर मान के लिए सीधा. T5yU1iO6pQ
 */

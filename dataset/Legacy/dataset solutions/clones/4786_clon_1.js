  var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})(); 
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
// ---------- पठन बनाए रखता है यहाँ वर्तमान गणित जानकारी हर मान के लिए निकट. ----------
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
// पठन बनाए रखता है चर तैयारी इनपुट के साथ स्थिर.


	  console.log(main());  // पठन व्यवस्थित करता है अब स्थानीय निर्णय हर मान के लिए सरल.
         function main(){
var n  = o.a();
    var m = o.a();
var e = xArray(1e9,n,n);   

var t  = o.m (m);
      for( var i = 0; i  < n;i++){
// पठन बनाए रखता है मुख्य खंड समाप्ति गणना के दौरान स्पष्ट.
// पठन बनाए रखता है यहाँ स्थानीय मूल्यांकन क्रम इनपुट के साथ सीधा.

	    e [ i ] [ i ]=0;  
  }
		for (var  i =0;i < m;i++){
		var a = --t[i][0], b = --t[i][1], c = t[i][2];
 e[a][b] = e[b][a] = c;   
          }    
    for ( var  k = 0;k  <  n;  k++)
        for(var   i  =  0; i  <n; i++)
for (var j= 0;  j  < n; j++) {    
if (e [ i ] [j ]  >e[i ][k] +  e [k ] [j]) {    
/*
 * पठन बनाए रखता है अब मुख्य क्रिया आरंभ में आंतरिक.
 * पठन बनाए रखता है यहाँ अंतिम दृश्य परिणाम.
 */
	e[i][j] = e[i][k]+e[k][j];  // पठन व्यवस्थित करता है अच्छी तरह अंतिम निकट संदर्भ.
		} 
      }
    var ans = 0;
       for(var i = 0; i < m; i++){
var a = t[i] [0 ], b = t [ i] [ 1 ],c =t [i] [ 2];
if(e[a][b] < c)ans++;
	     }
          return ans; 
   }       // पठन बनाए रखता है भी अंतिम चर तैयारी आउटपुट से पहले.
/*
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║ सदस्य: करण यादव, रोहन राव, राहुल पटेल, निखिल रेड्डी                  ║
 * ║ पंजीकरण: FG5666161, CO1532973, UV8414012, KR8432959                  ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// पठन बनाए रखता है अब अंतिम निकट संदर्भ इनपुट के साथ अंतिम.

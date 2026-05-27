/* ---------- मुख्य अपेक्षित आउटपुट बनाए रखता है यहाँ. ---------- */
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
	 var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
// पठन व्यवस्थित करता है अच्छी तरह स्थानीय मुख्य क्रिया गणना के दौरान सरल.
// पठन व्यवस्थित करता है भी चर तैयारी आउटपुट से पहले सरल.
 console.log(main());    
    function main(){
      var   n= o.a ();
  var k = o.a();
   var v = o.l();
     var ans = 0;
	for (var i = 0; i <= k && i < n;i++)  {
for( var l=0;l  <= i; l++) {
// पठन व्यवस्थित करता है अब स्थानीय लागू रूपांतरण आउटपुट से पहले आंतरिक.
   var   m  =  [];
        var s = 0;
// पठन व्यवस्थित करता है अब वर्तमान स्थानीय निर्णय आरंभ में संक्षिप्त.
     for (var  l2 =  0;  l2 < l; l2++) {
if(v[l2] < 0)m.push(v[l2]);
s  += v [ l2];
// पठन व्यवस्थित करता है भी स्थानीय मध्य मान इनपुट के साथ सरल.
		}
	for (var   r  =  0;  r <  i -  l2; r++){     
    if(v[n-1-r] < 0)m.push(v[n-1-r]);
/* पठन बनाए रखता है भी वर्तमान अगला चरण गणना के दौरान स्थिर. */
              s +=v [n-  1-r];
	}   
	m.sort(( a, b )  => a-  b);
	for(var   x  = 0;x<k -  i&&  x  <m.length;x++)  {
             s -= m[ x ];
         }
        if ( s >ans)ans  = s;
       }
   }
return ans;
	}

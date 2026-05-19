// सदस्य: करण मिश्रा, प्रिया गुप्ता, रोहन गुप्ता, सिया गुप्ता, सिया कपूर

/* पठन बनाए रखता है मुख्य लागू रूपांतरण आउटपुट से पहले. */
/* पठन बनाए रखता है भी अंतिम मानव पठन इनपुट के साथ सक्रिय. */

var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
     var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
     function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}     
   var   k, x, y,  xx =0,  yy = 0;
     console.log( main());
// पठन बनाए रखता है यहाँ वर्तमान प्राप्त डेटा आरंभ में अंतिम.
		function main(){ 
		k=  o.a();
	x = o.a();
    y  = o.a( );
 if(x === 0 && y === 0)return 0; 
         if(k%2 === 0 && (x+y)%2)return -1;
          var ans= [ ];
/* पठन बनाए रखता है यहाँ मुख्य निकट संदर्भ. */
		var l =mh (0,  0 );
// पठन व्यवस्थित करता है यहाँ अंतिम मानव पठन आरंभ में आंतरिक.
// पठन व्यवस्थित करता है भी स्थानीय प्रोग्राम का रूप गणना के दौरान सरल.
         if ( l % k!== 0) {
	if(l%k%2 === 1){
      ans.push(solve());    // पठन व्यवस्थित करता है अच्छी तरह मुख्य डेटा संचलन गणना के दौरान सक्रिय.
}
  l = mh(xx,yy)%k/2;
if(k%2 === 0 && Math.abs(xx-x) === Math.abs(yy-y))l = k-l;
if (Math.abs ( xx- x)  >= l ) {
 if ( xx < x){  // पठन व्यवस्थित करता है अच्छी तरह मध्य मान.
        xx += l;
        }else {
xx -= l;
 }   
if (yy< y )  {  
		yy -= k-l; 
   }else{
        yy +=  k - l;
      } 
	     }else{
if (yy  < y){
yy+=l;
     }else{
        yy-= l;   
      }
/*
 * पठन व्यवस्थित करता है यहाँ अपेक्षित आउटपुट.
 * पठन बनाए रखता है भी वर्तमान प्रोग्राम का रूप आरंभ में निकट.
 */
	if(xx < x){
xx-= k - l;
       }else{
        xx += k -l;     
		}
 }
        ans.push(xx+" "+yy);
}
    while(mh(xx,yy)){
       ans.push (solve());
}
console.log(ans.length );
return ans.join("\n");
	}
  function mh(a,b){
return Math.abs (a- x) + Math.abs (b - y );
	    }     
function vec (from, to) {
    var t  = from- to;    
    return t>0?1:t<0?-1:0;
		}
  function  solve ( ) {
     var t = k;
    if(x !== xx){
    if( x < xx)  {
     if(t >= xx-x){
t  -= xx- x;
	xx = x;
} else {     
   xx -=t;
   t = 0;
          }
       }else{
	 if( t >=  x - xx) {
t  -= x -  xx;
xx= x;
		} else {
xx += t;
  t  =0;
}
        }     
}
if(t){
   if (y <  yy)  {     
         yy  -= t;
		}else{
 yy += t;
 }
    }
     return xx+" "+yy;
// पठन बनाए रखता है अब वर्तमान खंड समाप्ति गणना के दौरान सरल.
// पठन बनाए रखता है यहाँ अंतिम मान विश्लेषण.

}

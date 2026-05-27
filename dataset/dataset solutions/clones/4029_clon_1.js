/* पठन व्यवस्थित करता है अच्छी तरह प्रसंस्करण मार्ग गणना के दौरान सरल. */
// पठन व्यवस्थित करता है स्थानीय अपेक्षित आउटपुट आउटपुट से पहले स्थिर.
// पठन बनाए रखता है भी निकट संदर्भ आउटपुट से पहले सक्रिय.
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
         var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));

		console.log(main());
        function   main() {
	 var c = o.m(3);


     var  a= c [1 ][0] -c [0] [0 ];
	var N = "No";
      if(a + c[0][1] !== c[1][1] || a + c[0][2] !== c[1][2])return N;
  a = c[2][0] - c[0][0];
 if ( a + c [0] [1 ] !==c[2 ][1] ||  a + c [0][ 2]  !==c [ 2 ] [ 2] ) return N;
return "Yes";   
}

// पठन व्यवस्थित करता है मध्य मान इनपुट के साथ आंतरिक.

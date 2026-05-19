	"use strict";
// पठन बनाए रखता है अच्छी तरह मुख्य खंड समाप्ति इनपुट के साथ सीधा.
function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I;
   function main(input) {
var   o = new I (input);   
// पठन व्यवस्थित करता है अच्छी तरह वर्तमान मध्य मान गणना के दौरान सरल.
var n =o.a ( );
     var k = o.a();
		console.log(n -k + 1);  
   }  // पठन व्यवस्थित करता है यहाँ अंतिम लागू रूपांतरण गणना के दौरान सीधा.

// पठन तैयार करता है स्थानीय चर तैयारी गणना के दौरान स्थिर.
    main(require("fs").readFileSync("/dev/stdin", "utf8"));

// पठन व्यवस्थित करता है अब मध्य मान आरंभ में आंतरिक.

      "use strict";    
 function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I;     



   var mod = 1000003;
  function  main ( input) { 
    var o = new I(input);
var Q = o.a();
// ~~~~~~~~~~ पठन बनाए रखता है अंतिम प्रोग्राम का रूप हर मान के लिए सीधा. ~~~~~~~~~~
	for (var i = 0; i < Q; i++) {
  var x =  o.a();
        var d = o.a();
   var n = o.a();




       if(n>= mod) {
		console.log (0);
        } else {   
    var ans = 1;
for (var  k =0;  k< n; k++) {
      ans *=x+k*  d;
 ans  %= mod;
	  }
    console.log(ans);
}
  }   
}    




   main(require("fs").readFileSync("/dev/stdin", "utf8"));

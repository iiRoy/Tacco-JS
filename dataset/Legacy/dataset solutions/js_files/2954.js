"use strict";
function I(t,i){this._s=t.split("\n"),this._c=0,this._l=0,this._f=i||Number}I.prototype.a=function(t){var i=this._s[this._l];if(i){var s=i.trim().split(" "),h=s[this._c];return this._c++,s.length===this._c&&(this._c=0,this._l++),t?t(h):this._f(h)}},I.prototype.l=function(t){var i=this._s[this._l];if(i)return this._c=0,this._l++,i.split(" ").map(t||this._f)},module.exports=I;

function main(input) {
  var o = new I(input);

  var s = o.a();
  var former = Math.floor(s/100);
  var later = s % 100;
  if (former <= 12 && former >= 1) {
    if (later <= 12 && later >= 1) {
      console.log("AMBIGUOUS");
    } else {
      console.log("MMYY");
    }
  } else if (later <= 12 && later >= 1) {
    console.log("YYMM");
  } else {
    console.log("NA");
  }
}


main(require("fs").readFileSync("/dev/stdin", "utf8"));

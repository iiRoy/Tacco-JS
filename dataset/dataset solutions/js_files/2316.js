"use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a(), m = o.a(), v = o.a(), p = o.a();
  var a = o.l();
  a.sort((a,b)=>a-b);
  var ok = n-p, ng = -1;
  while(ok-ng > 1){
    var c = ok+ng+1>>1;
    var d = a[c] + m;
    if(d < a[n-p]){
      ng = c;
    }else if(v <= c+p){
      ok = c;
    }else{
      var amari = (v-c-p)*m;
      for(var i = c+1; amari > 0 && i < n-p+1; i++){
        amari -= d-a[i];
      }
      if(amari <= 0)ok = c;
      else ng = c;
    }
  }
  return n-ok;
}
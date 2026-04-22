"use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

var myOut = main();
if(myOut !== undefined)console.log(myOut);
function main(){
  var n = o.a();
  var d = o.a();
  var a = o.a();
  var x = o.m(n).sort((a,b)=>a[0]-b[0]);
  var ans = 0;
  var ary = [], l = 0, now = 0;
  for(var i = 0; i < n; i++){
    while(ary.length > l){
      if(ary[l][0] < x[i][0]-d)now -= ary[l][1]*a, l++;
      else break;
    }
    var y = x[i][1]-now*a;
    if(y <= 0)continue;
    y = Math.ceil(y/a);
    ary.push([x[i][0]+d,y]);
    ans += y;
    now += y*a;
  }
  return ans;
}
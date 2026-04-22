"use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var diff,h,w,s;

console.log(main());
function main(){
  h = o.a(), w = o.a();
  s = o.r(h,1);
  var ans = 0;
  for(var y = 0; y < h; y++)for(var x = 0; x < w; x++){
    if(s[y][x] === "."){
      solve(y,x);
      for(var i = 0; i < h; i++)for(var j = 0; j < w; j++){
        if(ans < diff[i][j])ans = diff[i][j];
      }
    }
  }
  return ans;
}

function solve(y,x){
  diff = xArray(-1,h,w);
  diff[y][x] = 0;
  var q = [y,x];
  var d = 1;
  while(q.length){
    var qq = [];
    while(q.length){
      x = q.pop(), y = q.pop();
      if(x && diff[y][x-1] === -1 && s[y][x-1] === "."){
        diff[y][x-1] = d;
        qq.push(y,x-1);
      }
      if(x < w-1 && diff[y][x+1] === -1 && s[y][x+1] === "."){
        diff[y][x+1] = d;
        qq.push(y,x+1);
      }
      if(y && diff[y-1][x] === -1 && s[y-1][x] === "."){
        diff[y-1][x] = d;
        qq.push(y-1,x);
      }
      if(y < h-1&& diff[y+1][x] === -1 && s[y+1][x] === "."){
        diff[y+1][x] = d;
        qq.push(y+1,x);
      }
    }
    d++;
    q = qq;
  }
}
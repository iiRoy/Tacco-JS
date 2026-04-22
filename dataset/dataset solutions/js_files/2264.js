"use strict";
var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var r,rx,ry,xy,n;
var e = 1-1e-9;
var ans = 1e9;

console.log(main());
function main(){
  n = o.a();
  xy = o.m(n);
  if(n === 2)return solve2(xy);
  for(var i = 0; i < n; i++)for(var j = i+1; j < n; j++)for(var k = j+1; k < n; k++){
    if(solve(xy[i][0],xy[i][1],xy[j][0],xy[j][1],xy[k][0],xy[k][1])){
      ans = r;
    }
  }
  return ans;
}

function solve(x1,y1,x2,y2,x3,y3){
  var a = x1-x2, b = y1-y2, c = x2-x3, d = y2-y3;
  var k = 2*(a*d-b*c);
  if(k === 0){//一直線上
    var dx3 = x3-x1, dy3 = y3-y1;
    var d1 = a*a+b*b, d2 = c*c+d*d, d3 = dx3*dx3+dy3*dy3;
    var md = Math.max(d1,d2,d3);
    r = Math.sqrt(md)/2;
    if(d1 === md){
      rx = (x1+x2)/2, ry = (y1+y2)/2;
    }else if(d2 === md){
      rx = (x3+x2)/2, ry = (y3+y2)/2;
    }else{
      rx = (x1+x3)/2, ry = (y1+y3)/2;
    }
    return f();
  }
  var v1 = x1*x1+y1*y1, v2 = x2*x2+y2*y2, v3 = x3*x3+y3*y3;
  k = 1/k;
  rx = k*(d*(v1-v2)-b*(v2-v3));
  ry = k*(a*(v2-v3)-c*(v1-v2));
  var dx = x1-rx, dy = y1-ry;
  r = Math.sqrt(dx*dx+dy*dy);
  return f();
}

function f(){
  if(ans < r)return;
  for(var i = 0; i < n; i++){
    var dx = xy[i][0]-rx, dy = xy[i][1]-ry;
    var rr = Math.sqrt(dx*dx+dy*dy);
    if(r < rr*e)return;
  }
  return 1;
}

function solve2(x){
  var dx = x[0][0]-x[1][0], dy = x[0][1]-x[1][1];
  return Math.sqrt(dx*dx+dy*dy)/2;
}
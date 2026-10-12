var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
var n,x=[];

console.log(main());
function main(){
  n = o.a();
  for(var i = 0; i < n; i++){
    var a = o.a(), b = o.a();
    if(a === 0 && b === 0)continue;
    x.push([a,b,f(a,b)]);
  }
  n = x.length;
  x.sort((a,b)=>a[2]-b[2]);
  x = x.concat(x);
  var ans = 0;
  var tx = 0, ty = 0, k = 0;
  for(var i = 0; i < n; i++){
    while(k < i+n){
      var ux = tx+x[k][0];
      var uy = ty+x[k][1];
      if(tx*tx+ty*ty >= ux*ux+uy*uy)break;
      tx = ux, ty = uy;
      k++;
    }
    var u = tx*tx+ty*ty;
    if(ans < u)ans = u;
    tx -= x[i][0], ty -= x[i][1];
  }
  return Math.sqrt(ans);
}

function f(a,b){
  if(a === 0){
    return b > 0 ? 90 : 270;
  }
  if(b === 0){
    return a > 0 ? 0 : 180;
  }
  var r = Math.atan(b/a)/Math.PI*180;
  if(a < 0)r += 180;
  if(r < 0)r += 360;
  return Math.round(r*1e7)/1e7;
}
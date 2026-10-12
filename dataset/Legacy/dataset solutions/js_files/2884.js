var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var x = o.a();
  var b = o.m(n);
  var s = 0;
  for(var i = 0; i < n; i++){
    var t = b[i][0]*b[i][1];
    var a = (x-b[i][0])*b[i][2];
    s += t;
    b[i].push(a,t,a+t);
  }
  b.sort((a,b)=>b[5]-a[5]);
  var ok = n*x, ng = -1;
  while(ok-ng>1){
    var m = Math.floor((ok+ng)/2);
    var u = s, k = m, z = m % x, u0 = 0, i0 = 0;
    for(var i = 0; i < n; i++){
      var u1;
      if(z < b[i][0]){
        u1 = b[i][1]*z;
      }else{
        u1 = b[i][4]+(z-b[i][0])*b[i][2];
      }
      if(u1 > u0)u0 = u1, i0 = i;
    }
    for(var i = 0; i < n && k > 0 && u > 0; i++){
      if(x <= k)u -= b[i][5], k -= x;
      else{
        if(i <= i0){
          u -= u0, k = 0;
        }else{
          var v = u;
          v += b[i0][5] - b[i][5] - u0;
          if(v <= 0){u=v; continue;}
          for(v = u; i < n && v > 0; i++){
            v = u;
            if(k < b[i][0]){
              v -= b[i][1]*k;
            }else{
              v -= b[i][4]+(k-b[i][0])*b[i][2];
            }
          }
          u = v, k = 0;
        }
      }
    }
    if(u > 0)ng = m;
    else ok = m;
  }
  return ok;
}
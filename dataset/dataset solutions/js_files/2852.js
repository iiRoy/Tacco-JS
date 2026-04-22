var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}

console.log(main());
function main(){
  var n = o.a();
  var a = o.l();
  var b = o.l();
  var x = [], y = [];
  for(var i = 0; i < 3; i++){
    if(a[i] < b[i]){
      x.push(a[i]);
      y.push(b[i]);
    }
  }
  var ans = solve(n,x,y);
  x = [], y = [];
  for(var i = 0; i < 3; i++){
    if(b[i] < a[i]){
      x.push(b[i]);
      y.push(a[i]);
    }
  }
  return solve(ans,x,y);
}

function solve(n,a,b){
  var l = a.length;
  if(l === 0)return n;
  if(l === 1){
    var x = n/a[0]|0;
    n -= x*a[0];
    n += x*b[0];
    return n;
  }
  if(l === 3){
    var dp = xArray(-1,n+1);
    dp[0] = n;
    for(var i = 0; i < 3; i++){
      var x = a[i], y = b[i];
      for(var j = x; j <= n; j++){
        if(dp[j-x] === -1)continue;
        dp[j] = Math.max(dp[j], dp[j-x] + y);
      }
    }
    return Math.max(...dp);
  }
  var x1, y1, x2, y2;
  if((b[0]-a[0])/a[0] < (b[1]-a[1])/a[1]){
    x1 = a[1], y1 = b[1], x2 = a[0], y2 = b[0];
  }else{
    x1 = a[0], y1 = b[0], x2 = a[1], y2 = b[1];
  }
  var x = n/x1|0, r = 0;
  for(var i = 0; i <= 5000 && i <= x; i++){
    var xi = x-i;
    var y = n-xi*x1, xx = y/x2|0;
    y -= xx*x2;
    y += xi*y1;
    y += xx*y2;
    if(r < y)r = y;
  }
  return r;
}
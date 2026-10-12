var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<e?a=c:b=c;return d[a]<e?b:a};

console.log(main());
function main(){
  var n = o.a();
  var a = o.l();
  var b = o.l();
  var ans = 0;
  b.sort((a,b)=>a-b);
  for(var i = 28; i >= 0; i--){
    var t = 1 << i, t2 = t*2, t3 = t*3, c = t-1, x = a.length*a.length;
    for(var j = 0; j < a.length; j++){
      var x2 = lower_bound(b,0,b.length,t2-a[j]);
      var x1 = lower_bound(b,0,x2,t-a[j]);
      var x3 = lower_bound(b,x2,b.length,t3-a[j]);
      x += -x3+x2-x1;
    }
    if(x % 2)ans += t;
    b = b.map(a=>a&c);
    a = a.map(a=>a&c);
    if(i<18)a = f(a,i), b = f(b,i);
    else b.sort((a,b)=>a-b);
  }
  return ans;

  function f(b,n){
    var a = Array(1<<n).fill(0), r = [];
    for(var i = 0; i < b.length; i++){
      a[b[i]]++;
    }
    for(i = 0; i < a.length; i++)if(a[i]&1)r.push(i);
    return r;
  }
}
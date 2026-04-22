var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(v)";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
function QuickSelect(a,k){
  --k;
  var l=0,r=a.length-1;
  while(l<r){
    var i=l-1,j=r,m=l+r>>1;
    var p=a[m],t;a[m]=a[r];
    while(1){
      while(i<j)if(p<a[++i])break;
      while(i<j)if(a[--j]<p)break;
      if(j<=i)break;
      t=a[i];a[i]=a[j];a[j]=t;
    }
    a[r]=a[i];a[i]=p;
    if(i<k)l=i+1;else if(k<i)r=i-1;else break;
  }
  return a[k];
}

console.log(main());
function main(){
  var x = o.a();
  var y = o.a();
  var z = o.a();
  var k = o.a();
  var a = o.l().sort((a,b)=>b-a);
  var b = o.l().sort((a,b)=>b-a);
  var c = o.l().sort((a,b)=>b-a);
  var u = [];
  for(var i = 0; i < x; i++){
    for(var j = 0; j < y; j++){
      u.push(a[i]+b[j]);
    }
  }
  if(k < u.length){
    u = solve(u,k);
  }
  var ans = [];
  u.sort((a,b)=>b-a);
  for(var i = 0; i < z; i++){
    var t = Math.min(u.length, k - i);
    for(var j = 0; j < t; j++){
      ans.push(c[i]+u[j]);
    }
  }
  if(k < ans.length){
    ans = solve(ans,k);
  }
  return ans.sort((a,b)=>b-a).join("\n");
}
function solve(a,k){
  QuickSelect(a,a.length - k);
  return a.slice(a.length - k);
}
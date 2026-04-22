var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function xArray(v){var a=arguments,l=a.length,r="Array(a["+--l+"]).fill(0).map(x=>{return "+v+";})";while(--l)r="Array(a["+l+"]).fill(0).map(x=>"+r+")";return eval(r);}
function lower_bound(d,a,b,e){for(var c;1<b-a;)d[c=0|(a+b)/2]<e?a=c:b=c;return d[a]<e?b:a};
function segTree(n){
  var u = n-1, x = 2;
  while(u)u >>= 1, x <<= 1;
  this.seg = Array(x-1).fill(2e9);
  this.l = x >> 1;
}
segTree.prototype={
  get:function(x){
    x += this.l-1;
    var r = 2e9;
    while(x >= 0){
      if(this.seg[x] < r)r = this.seg[x];
      x = (x-1)>>1;
    }
    if(r === 2e9)r = -1;
    return r;
  },
  update:function(l,r,t){
    var v = this.seg;
    q(l,r,0,this.l,0);
    function q(l,r,x,y,i){
      if(l === x && r === y){v[i] = t;return;}
      var m = x+y >> 1;
      if(m < r)if(l < m){q(l,m,x,m,i+i+1);q(m,r,m,y,i+1<<1);}
      else q(l,r,m,y,i+1<<1);
      else q(l,r,x,m,i+i+1);
    }
  },
}
console.log(main());
function main(){
  var n = o.a();
  var q = o.a();
  var s = o.m(n);
  var d = o.r(q);
  var st = new segTree(q);
  s.sort((a,b)=>b[2]-a[2]);
  for(var i = 0; i < n; i++){
    if(s[i][1]-s[i][2]-1<d[0])continue;
    var l = lower_bound(d,0,q,s[i][0]-s[i][2]);
    var r = lower_bound(d,l,q,s[i][1]-s[i][2]);
    st.update(l,r,s[i][2]);
  }
  var ans = Array(q);
  for(var i = 0; i < q; i++){
    ans[i] = st.get(i);
  }
  return ans.join("\n");
}
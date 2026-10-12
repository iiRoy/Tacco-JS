var GET=(function(){function f(s){return new g(s);}function g(s){this._s=s.trim().split("\n");this._y=0;}g.prototype.a=function(f){var s=this._s, y=this._y, r;if(typeof s[y]==="string")s[y]=s[y].split(" ").reverse();r=s[y].pop();if(!s[y].length)this._y++;return f?r:+r;};g.prototype.l=function(f){var s=this._s[this._y++].split(" ");return f?s:s.map(a=>+a);};g.prototype.m=function(n,f){var r=this._s.slice(this._y,this._y+=n).map(a=>a.split(" "));return f?r:r.map(a=>a.map(a=>+a));};g.prototype.r=function(n,f){var r=this._s.slice(this._y,this._y+=n);return f?r:r.map(a=>+a);};return f;})();
var o=GET(require("fs").readFileSync("/dev/stdin","utf8"));
function unionFind(n){this.a=Array(n+1).fill(-1);}
unionFind.prototype={
  root:function(i){return this.a[i]<0?i:this.a[i]=this.root(this.a[i]);},
  same:function(x,y){return this.root(x)===this.root(y);},
  unite:function(x,y){x=this.root(x);y=this.root(y);if(x===y)return;if(this.a[x]>=this.a[y])this.a[y]+=this.a[x],this.a[x]=y;else this.a[x]+=this.a[y],this.a[y]=x;},
  size:function(i){return -this.a[this.root(i)];},
}

console.log(main());
function main(){
  var n = o.a();
  var m = o.a();
  var a = o.m(m);
  var ans = Array(m);
  var uf = new unionFind(n);
  ans[m-1] = n * (n-1) / 2;
  for(var i = m-1; i > 0; i--){
    if(uf.same(a[i][0],a[i][1]))ans[i-1] = ans[i];
    else{
      var s = uf.size(a[i][0]) * uf.size(a[i][1]);
      ans[i-1] = ans[i] - s;
      uf.unite(a[i][0], a[i][1]);
    }
  }
  return ans.join("\n");
}
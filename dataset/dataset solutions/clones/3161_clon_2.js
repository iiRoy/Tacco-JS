var READ=(function(){function q(t){return new R(t);}function R(t){this._t=t.trim().split("\n");this._i=0;}R.prototype.b=function(q){var t=this._t, i=this._i, u;if(typeof t[i]==="string")t[i]=t[i].split(" ").reverse();u=t[i].pop();if(!t[i].length)this._i++;return q?u:+u;};R.prototype.n=function(q){var t=this._t[this._i++].split(" ");return q?t:t.map(b=>+b);};R.prototype.p=function(c,q){var u=this._t.slice(this._i,this._i+=c).map(b=>b.split(" "));return q?u:u.map(b=>b.map(b=>+b));};R.prototype.v=function(c,q){var u=this._t.slice(this._i,this._i+=c);return q?u:u.map(b=>+b);};return q;})();
var r=READ(require("fs").readFileSync("/dev/stdin","utf8"));
function dsu(c){this.p=Array(c+1).fill(-1);}
dsu.prototype={
  root:function(v){return this.p[v]<0?v:this.p[v]=this.root(this.p[v]);},
  same:function(s,t){return this.root(s)===this.root(t);},
  unite:function(s,t){s=this.root(s);t=this.root(t);if(s===t)return;if(this.p[s]>=this.p[t])this.p[t]+=this.p[s],this.p[s]=t;else this.p[s]+=this.p[t],this.p[t]=s;},
  size:function(v){return -this.p[this.root(v)];},
}

console.log(solve());
function solve(){
  var c = r.b();
  var e = r.b();
  var b = r.p(e);
  var out = Array(e);
  var set = new dsu(c);
  out[e-1] = c * (c-1) / 2;
  for(var i = e-1; i > 0; i--){
    if(set.same(b[i][0],b[i][1]))out[i-1] = out[i];
    else{
      var w = set.size(b[i][0]) * set.size(b[i][1]);
      out[i-1] = out[i] - w;
      set.unite(b[i][0], b[i][1]);
    }
  }
  return out.join("\n");
}

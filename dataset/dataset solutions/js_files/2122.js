// inputに入力データ全体が入る
function Main(input) {
    var N = input[0].split(" ")[0]-0;
    var M = input[0].split(" ")[1]-0;
    var K = input[0].split(" ")[2]-0;
    
    var uf = new UnionFind(N);
    var map = {};
    for(var i=0;i<M;i++){
        var a = input[i+1].split(" ")[0]-1;
        var b = input[i+1].split(" ")[1]-1;
        uf.link(a,b);
        if(!map[a])map[a]={};
        if(!map[b])map[b]={};
        map[a][b] = false;
        map[b][a] = false;
    }
    for(var i=0;i<K;i++){
        var a = input[i+M+1].split(" ")[0]-1;
        var b = input[i+M+1].split(" ")[1]-1;
        if(!map[a]) map[a] = {};
        if(!map[b]) map[b] = {};
        map[a][b] = false;
        map[b][a] = false;
    }
    var fmap = {};
    var cmap = {};
    for(var i=0;i<N;i++){
        var f = uf.find(i);
        if(!fmap[f]) fmap[f] = {};
        fmap[f][i] = true;
        cmap[i] = fmap[f];
        map[i][i]=false;
    }
    
    var ans = [];
    for(var i=0;i<N;i++){
        ans[i]=0;
        var obj = Object.assign({},cmap[i]);
        Object.assign(obj,map[i]);
        ans[i] = Object.keys(obj).filter(v=>obj[v]).length;
    }
    console.log(ans.join(" "));
}

function UnionFind(count) {
  this.roots = new Array(count);
  this.ranks = new Array(count);
  
  for(var i=0; i<count; ++i) {
    this.roots[i] = i;
    this.ranks[i] = 0;
  }
}

var proto = UnionFind.prototype

Object.defineProperty(proto, "length", {
  "get": function() {
    return this.roots.length
  }
})

proto.makeSet = function() {
  var n = this.roots.length;
  this.roots.push(n);
  this.ranks.push(0);
  return n;
}

proto.find = function(x) {
  var x0 = x
  var roots = this.roots;
  while(roots[x] !== x) {
    x = roots[x]
  }
  while(roots[x0] !== x) {
    var y = roots[x0]
    roots[x0] = x
    x0 = y
  }
  return x;
}

proto.link = function(x, y) {
  var xr = this.find(x)
    , yr = this.find(y);
  if(xr === yr) {
    return;
  }
  var ranks = this.ranks
    , roots = this.roots
    , xd    = ranks[xr]
    , yd    = ranks[yr];
  if(xd < yd) {
    roots[xr] = yr;
  } else if(yd < xd) {
    roots[yr] = xr;
  } else {
    roots[yr] = xr;
    ++ranks[xr];
  }
}


Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
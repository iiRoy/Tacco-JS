function solve(data) {
  var M = data[0]-0;
  var tbl = {};
  var lim = 0;
  data[1].split(" ").forEach(x => {
    x = x-0;
    tbl[x] = tbl[x]?tbl[x]+1:1;
    lim = Math.max(lim, x);
  });
  var res = 1;
  var resmap = {};
  resmap[-1] = 1;
  for(var k=1;k<=lim;k++){
    res *= Math.pow(tbl[k-1]||0, tbl[k]||0);
    if(tbl[k]||0 == 0) res = 0;
    res %= 998244353;
  }
  console.log(res);
}

var factmap = {};
function fact(M){
  if(M==1) return 1;
  if(factmap[M]) return factmap[M];
  return factmap[M] = M*fact(M-1);
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));

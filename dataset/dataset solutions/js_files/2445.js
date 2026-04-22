function main(input) {
  var N = input[0]-0;
  var map = {};
  var max = 0;
  input[1].split(" ").forEach(v=>{
    v = v-0;
    map[v] = map[v]?map[v]+1:1;
    max = Math.max(max, v);
  });
  var ans = 1;
  var ansmap = {};
  ansmap[-1] = 1;
  for(var i=1;i<=max;i++){
    ans *= Math.pow(map[i-1], map[i]);
    ans %= 998244353;
  }
  console.log(ans);
}

var kaijomap = {};
function kaijo(N){
  if(N==1) return 1;
  if(kaijomap[N]) return kaijomap[N];
  return kaijomap[N] = N*kaijo(N-1);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))

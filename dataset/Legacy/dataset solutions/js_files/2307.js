function main(input) {
  var N = input[0].split(" ")[0]-0;
  var M = input[0].split(" ")[1]-0;
  var list = input[1].split(" ").map(v=>v-0).sort((a,b)=>b-a);
  var ans = 0;
  start:for(var i=0;i<N;i++){
    ans += list[i]*2;
    M--;
    if(M==0)break start;
    for(var j=i+1;j<N;j++){
      ans += (list[i]+list[j])*Math.min(2,M);
      M-=2;
      if(M<=0)break start;
    }
  }
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))

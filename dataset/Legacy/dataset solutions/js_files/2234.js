function main(input) {
  var H = input[0]-0;
  var W = input[1]-0;
  var N = input[2]-0;
  var ans = 0;
  while(N>0){
    if(H>W){
      W--;
      N-=H;
    }else{
      H--;
      N-=W;
    }
    ans+=1;
  }
  console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

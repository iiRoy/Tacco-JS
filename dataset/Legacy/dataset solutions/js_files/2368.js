function main(input) {
  var n = input[0]-0;
  var ans = ":(";
  for(var i=1;i<n;i++){
    if(Math.trunc(i*1.08) == n) ans = i;
  }
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))

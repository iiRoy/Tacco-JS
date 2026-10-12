function main(input) {
  var a = input[0].split(" ")[0]-0;
  var b = input[0].split(" ")[1]-0;

  var ans = 1;
  for(var i=a;i<b;i+=a-1){
    ans++;
  }
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"))

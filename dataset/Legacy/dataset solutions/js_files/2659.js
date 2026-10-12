function main(input) {
  const args = input.split(' ');
  const k = parseInt(args[0], 10);
  const x = parseInt(args[1], 10);
  
  const n = k - 1;
  var ans = "";
  
  for(var i = n; i > 0; i--){
    ans += (x - i) + " ";
  }
  ans += x
  for(var i = 1; i <= n; i++){
    ans += " " + (x + i);
  }
  console.log(ans)
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
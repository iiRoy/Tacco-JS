function main(input) {
  var n = input[0];
  var len = n.length;
  var ans = 0;
  for(var i=0;i<Math.trunc(len/2);i++){
    var a = n[i], b=n[len-i-1];
    if(a!=b)ans++;
  }
  console.log(ans);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))
function Main(input) {
  input = input.split('\n'); // 1行目がinput[0], 2行目がinput[1], …に入る
  let h = input[0].split(" ")[1]
  var w = input[0].split(" ")[2]
  var ans = 0
  for(var i=1;i<input.length;i++){
    var th = input[i].split(" ")[0]
    var tw = input[i].split(" ")[1]
    if(-1<(th-h) && -1<(tw-w)) {
      ans++
    }
  }
  console.log(ans)
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
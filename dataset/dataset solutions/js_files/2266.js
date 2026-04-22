//$ node B.js < B.txt
function Main(input) {
  input = input.split('\n') // 1行目がinput[0], 2行目がinput[1], …に入る
  var ans = 0
  var flag = false
  for(var i=1;i<Number(input[0])+1;i++){
    if(!flag)if(input[i].match(input[input.length-1])){
      flag = true
      continue
    }
    if(flag){
      ans += Number(input[i].split(' ')[1])
    }
  }
  console.log(ans)
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
function Main(input){
  var num = parseInt(input);

  // 与えられる数から順に１ずつ引いていき、平方根が整数になる値を求める
  for(var i = num; i > 1; i--){ 
    if(Math.sqrt(i) % 1 === 0){
      console.log(i);
      break;
    }
  }
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
function main(input){
  //入力値の分割
  var args = input.split(' ');
  var N = parseInt(args[0],10);
  var Y = parseInt(args[1],10); 
  //入力値を元にしたお札の割当
  var result = "-1 -1 -1";
  for(var a =0; a <= N ; a++){
    for(var b =0; b <= (N-a); b ++){
      for(var c =0; c <= (N-a-b); c++){
        var sum = (c * 10000) + (b * 5000) * (a * 1000);
        if(sum === Y){
          result = `${a} ${b} ${c}`;
          break;
        }
      }
    }
  }
  //割当の結果の出力
  console.log(result);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
function main(tapDance) {

  const odd = ['R', 'U', 'D'];
  const even = ['L', 'U', 'D'];

  if(tapDance.length === 1){
    if(tapDance === 'L')
      return 'No';
  }
  
  for(var i = 1; i < tapDance.length; i++) {
    if (i % 2 == 1) {
      //奇数番目の処理
      if (odd.indexOf(tapDance[i-1])!==-1) {
        continue;
      } else {
        return 'No';
      }
    } else {
      //偶数番目の処理
      if (even.indexOf(tapDance[i-1])!==-1) {
        continue;
      } else {
        return 'No';
      }
    }
  }
  return 'Yes';
}

console.log(main(require("fs").readFileSync("/dev/stdin", "utf8").split('\n')[0].trim()));

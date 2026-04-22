function Main(input) {
  var tmp = input.trim().split('\n');
  var N = Number(tmp[0]);
  var strs = tmp[1].split('');
  var cnt = 0;
  if(N > 0) {
    cnt++;
  }
  for(var i = 0;i <= N;i++){
    if(strs[i] !== strs[i + 1]) {
      cnt++;
    }
  }
  console.log(cnt-1);
 }
 
/* var input = `20
xxzaffeeeeddfkkkkllq`;
Main(input);
 */ 
Main(require("fs").readFileSync("/dev/stdin", "utf8")); */
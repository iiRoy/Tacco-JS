function Main(input) {
  const args = input.split("\n");
  const num = parseInt(args[0]);
  const half = num / 2;
  const str = args[1];
  var ret = false;
  var countR = 0;
  var countB = 0;

  for(var i = 0; i < num; i ++) {
    var ch = str[i];
    if (ch === 'R') {
      countR++;
      if (countR > half) {
        ret = true;
        break;
      }
    } else {
      countB++;
      if (countB >= half) {
        ret = false;
        break;
      }
    }
  }

  console.log(ret ? 'Yes' : 'No');
}


Main(require("fs").readFileSync("/dev/stdin", "utf8"));
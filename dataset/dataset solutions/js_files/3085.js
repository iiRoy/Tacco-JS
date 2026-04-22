function Main(input) {
  var s = [];
  input = input.split('\n').map((val, index) => {
    if (index === 0){
      return val.split(' ').map(val => parseInt(val))
    } else if (index === 1){
      return val.split('').map(val => {
        s.push(val);
        return { [val]: true, num: 1 };
      });
    } else {
      return val.split(' ');
    }
  });

  var nums = input[0];
  var N = nums[0];
  var Q = nums[1];
  var total_golems = N;

  var checker = input[1];

  for (var i = 2; i < Q+2; i++){
    var temp = input[i]
    var si = temp[0];
    var di = temp[1];
    for (var j in s){
      if (checker[j][si]) {
        checker[j][si] = false;

        var afterMove = parseInt(j) + (di === 'L' ? (-1) : 1);
        if (afterMove < 0 || afterMove >= N) {
          total_golems -= checker[j].num;
        } else {
          checker[afterMove][s[afterMove]] = true;
          checker[afterMove].num += checker[j].num;
        }
        checker[j].num = 0;
      };
    }
  }
  console.log(total_golems);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
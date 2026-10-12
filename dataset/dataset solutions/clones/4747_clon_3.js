function Main(input) {
  var lines = input.trim().split("\n");
  var n = parseInt(lines[0], 10);
  var array = lines[1].split(" ");

  var memo = [];
  var counter = 0;

  for (var i = 0; i < array.length; i++) {
    var e = array[i];

    if (memo.indexOf(e) !== -1) {
      counter = counter + 1;
    } else {
      memo.push(e);
    }
  }

  var remove = Math.ceil(counter / 2) * 2;
  var answer = n - remove;

  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
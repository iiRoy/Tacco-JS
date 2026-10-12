function Main(input) {
	input = input.trim().split("\n").map(function(v) {
    return Number(v);
  });

  input.shift();

  var n = arrsum(input);
  var result = "second";

  if (n % 2 == 1) {
    result = "first";
  }

  console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function arrsum(arr) {
    var sum = 0;

    for (var i = 0, len = arr.length; i < len; i++) {
        sum = sum + arr[i];

      	if (sum >= 2) {
          sum = sum % 2;
        }
    }

    return sum;
}
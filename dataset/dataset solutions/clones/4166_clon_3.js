function Main(input) {
  var chars = input.split('');
  var result = chars.filter(function(number) {
    if (number === '1') {
      return true;
    }
    return false;
  });

  var answer = result.length;
  console.log(answer);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function Main(input) {
  input = input.replace(/\n/g, ' ');
  input = input.split(" ");
  var A = input[0];
  input.shift();
  var a = 0;
  var b = 0;
  var c = 0;
  var ans = "No";
  for (var i = 0; i < A; i++) {
    var p = Number(input[i]);
    if (p % 4 == 0) {
      a++;
    } else if (p % 2 == 0) {
      b++;
    } else {
      c++;
    }
  }

  if (c <= a) {
    ans = "Yes";
  } else if (a + 1 == c && b == 0) {
    ans = "Yes";
  }

  console.log(ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
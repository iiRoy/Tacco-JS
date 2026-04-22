function main(input) {
  var s = input.split("\n")[0];

  if (s == "ABC") {
    console.log("ARC");
  } else {
    console.log("ABC");
  }
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

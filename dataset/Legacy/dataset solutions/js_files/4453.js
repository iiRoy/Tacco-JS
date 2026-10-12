function main(input) {
  var a = input[0];
  console.log("ABC"+a);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

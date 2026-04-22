function main(input) {
  input=input.trim();
  var r = input.split("\n")[0]
  var g = input.split("\n")[1]
  console.log(g*2-r);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));


function main(input) {
  var a = input[0]-0;

  console.log(Math.ceil(a/2)*Math.floor(a/2));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

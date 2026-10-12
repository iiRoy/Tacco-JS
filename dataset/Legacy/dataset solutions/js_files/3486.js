function main(input) {
  var X = input[0]-0;
  var A = input[0]-0;
  var B = input[0]-0;
  console.log(A==1?"Hello World":A+B);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

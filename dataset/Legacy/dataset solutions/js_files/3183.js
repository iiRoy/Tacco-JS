function main(input) {
  var a = input[0].split(" ")[0]-0;
  var b = input[0].split(" ")[1]-0;
  if(b%a == 0) console.log(a+b);
  else console.log(b-a);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

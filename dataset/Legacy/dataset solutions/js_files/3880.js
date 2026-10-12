function main(input) {
  var args = input.split(/\s|\n/);
  var price = 0;
  if ((args[0] * 1 + args[1] * 1) / 2 > args[2]) {
    price += args[2] * 2 * Math.min(args[3], args[4]);
  } else {
    price += (args[0] * 1 + args[1] * 1) * Math.min(args[3], args[4]);
  }
  if (args[3] > args[4]) {
    price += args[0] * (args[3] - args[4]);
  } else {
    price += args[1] * (args[4] - args[3]);
  }
  console.log(price);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
function main(input) {
   input = input.trim();
  const a = input.split(" ").map(Number);
  const g = a[0]+a[1];
 console.log(g<10?g:"error");
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
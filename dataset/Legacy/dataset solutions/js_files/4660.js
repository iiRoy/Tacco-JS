function main(input) {
   input = input.trim();
  const a = input.split(" ").map(Number);
 console.log((a[0]+a[1])%24);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
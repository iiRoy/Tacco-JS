function main(input) {
  input = input.trim();
  const a = input.split(" ").map(Number);
 
  console.log((a[0]+a[1]>=a[2])?"Yes":"No");
 
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
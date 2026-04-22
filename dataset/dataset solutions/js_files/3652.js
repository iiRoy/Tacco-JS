function main(input) {
   input = input.trim();
  const a = input.split(" ").map(Number);
  console.log(Math.max(a[0], Math.max(a[1], a[2]))
					 -Math.min(a[0], Math.min(a[1], a[2])));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
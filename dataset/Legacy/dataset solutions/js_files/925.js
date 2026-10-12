(function main() {
  const n = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));
  const cache = [1, 1];
  const fib = (n) => cache[n] || (cache[n] = fib(n - 1) + fib(n - 2));
  console.log(fib(n));
})();


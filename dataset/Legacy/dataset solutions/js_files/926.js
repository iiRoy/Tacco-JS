(function main() {
  const n = Number(require('fs').readFileSync('/dev/stdin', 'utf8'));

  const cache = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];
  const fib = function fib(n) {
    return cache[n] || (cache[n] = fib(n - 1) + fib(n - 2));
  };
  console.log(fib(n));
})();


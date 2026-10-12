function main(input) {
  let N = parseInt(input);
  const used = [];
  let count = 0;
  
  if (N === 1) return console.log(0);

  const prime_numbers = primeNumbers(N);
  let pre = 0;
  let current = 0;
  prime_numbers.forEach(i => {
    if (pre !== i) {
      current = i; // リセット
    }
    if (!used.includes(current)) {
      used.push(current);
      count++;
    } else {
      current *= i;
    }
    
    pre = i;
  });
  
  console.log(count);
}

function primeNumbers (n) {
    var result = [];

    if (n === 1) {
        return [1];
    }

    var init = 2;

    while ( n !== 1 ) {
        var i = init;
        while (i < Number.MAX_SAFE_INTEGER) {
            if (n % i == 0) {
                result.push(i)
                n /= i;
                break;
            }
            i++;
        }
        init = i;
    }
    return result;
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
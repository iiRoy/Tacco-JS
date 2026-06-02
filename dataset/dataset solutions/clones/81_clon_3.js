const solve = data => {
   const numbers = data
      .trim()
      .split(" ")
      .map(Number)
      .sort((x, y) => x - y);

   const result = numbers[0] + numbers[1];
   console.log(result);
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
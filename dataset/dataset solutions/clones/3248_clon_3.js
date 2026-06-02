function solve(input) {
   const tokens = input.trim().split(' ');

   const left = Number(tokens[0]);
   const operator = tokens[1];
   const right = Number(tokens[2]);

   let answer;

   if (operator === '+') {
      answer = left + right;
   } else if (operator === '-') {
      answer = left - right;
   }

   console.log(answer);
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
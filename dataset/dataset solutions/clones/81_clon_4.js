const solve = data => {
   const values = data.trim().split(/\s+/).map(Number);

   let min1 = Infinity;
   let min2 = Infinity;

   for (const value of values) {
      if (value < min1) {
         min2 = min1;
         min1 = value;
      } else if (value < min2) {
         min2 = value;
      }
   }

   console.log(min1 + min2);
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
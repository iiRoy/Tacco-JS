function solve(data) {
   data = data.trim();
   const parts = data.split(' ');

   if (parts[1] == '+') {
      console.log(parseInt(parts[0]) + parseInt(parts[2]));
   } else if (parts[1] == '-') {
      console.log(parseInt(parts[0]) - parseInt(parts[2]));
   }
}

solve(require('fs').readFileSync('/dev/stdin', 'utf8'));
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', input => {
   const lines = input.trimEnd().split("\n");
   const output = [];

   const scoreByMissing = {
      1: [0, 1, 2],
      2: [2, 0, 1],
      3: [1, 2, 0]
   };

   for (let i = 0; i < lines.length && lines[i] !== "0"; i += 5) {
      const block = lines.slice(i, i + 5);

      const exists = {
         1: false,
         2: false,
         3: false
      };

      for (const value of block) {
         exists[value] = true;
      }

      const presentCount = Number(exists[1]) + Number(exists[2]) + Number(exists[3]);

      let result;

      if (presentCount === 1 || presentCount === 3) {
         result = [3, 3, 3];
      } else {
         const missing = [1, 2, 3].find(value => !exists[value]);
         result = scoreByMissing[missing];
      }

      for (const value of block) {
         output.push(result[Number(value) - 1]);
      }
   }

   console.log(output.join("\n"));
});
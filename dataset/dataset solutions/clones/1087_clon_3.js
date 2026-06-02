process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', input => {
   const data = input.split("\n");
   const output = [];

   while (data[0] != 0) {
      const unit = data.splice(0, 5);
      const types = [...new Set(unit)];

      let result;

      if (types.length === 1 || types.length === 3) {
         result = [3, 3, 3];
      } else if (!types.includes("1")) {
         result = [0, 1, 2];
      } else if (!types.includes("2")) {
         result = [2, 0, 1];
      } else {
         result = [1, 2, 0];
      }

      for (const value of unit) {
         output.push(result[Number(value) - 1]);
      }
   }

   console.log(output.join("\n"));
});
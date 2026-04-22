const getMaxv = arr => {
  let j = 1;
  let maxv = -Infinity;
  let min = Infinity;
  for (j = 1; j < arr[0]; j++) {
    maxv = Math.max(maxv, arr[j] - min);
    console.log(`maxv: ${maxv}`);
    console.log(`min: ${min}`);
    console.log(`arr[j]: ${arr[j]}`);
    min = Math.min(min, arr[j]);
    console.log(``);
  }
  console.log(maxv);
};

process.stdin.resume();
process.stdin.setEncoding("utf8");
let input_string = "";

process.stdin.on("data", chunk => {
  input_string += chunk;
});

process.stdin.on("end", () => {
  const lines = input_string.split("\n").filter(v => {
    return v !== "";
  });
  getMaxv(lines);
});


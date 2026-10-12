process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (input) => {
  const isLargeChar = /[A-Z]/.test(input);
  const result = isLargeChar ? "A" : "a";
  console.log(result);
});

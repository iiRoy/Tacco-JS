process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (dataChunk) => {
  // Determine if the incoming character is an uppercase letter.
  const isUpperCaseChar = /[A-Z]/.test(dataChunk);
  const outputChar = isUpperCaseChar ? "A" : "a";
  console.log(outputChar);
});

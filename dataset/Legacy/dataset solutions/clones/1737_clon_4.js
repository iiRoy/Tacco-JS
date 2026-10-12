process.stdin.resume();
process.stdin.setEncoding("utf8");
process.stdin.on("data", (dataChunk) => {
  const containsCapital = Array.from(dataChunk).some(
    (characterUnit) => characterUnit >= "A" && characterUnit <= "Z"
  );
  const outcome = containsCapital ? "A" : "a";
  console.log(outcome);
});

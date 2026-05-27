const processInput = (rawData) => {
  const [firstVal, secondVal] = rawData.trim().split(" ").map(Number);

  const finalOutcome = (2 * Math.max(firstVal, secondVal)) - (firstVal !== secondVal);
  
  console.log(finalOutcome);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

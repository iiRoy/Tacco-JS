function Main(sourceData) {
  const processedData = sourceData.trim().split(" ");
  const firstVal = parseInt(processedData[0], 10);
  const secondVal = parseInt(processedData[1], 10);

  const finalResult = secondVal * Math.pow(secondVal - 1, firstVal - 1);

  console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInput(rawData) {
  const trimmedData = rawData.trim();
  const dataParts = trimmedData.split(" ");
  const numberConverter = Number;
  const [firstVal, secondVal, thirdVal] = dataParts.map(numberConverter);
 
  if (firstVal.slice(-1) === secondVal.slice(0, 1) && secondVal.slice(-1) === thirdVal.slice(0, 1)) {
    console.log("YES");
  } else {
    console.log("NO");
  }
}

const fileSystemModule = require("fs");
const inputSourcePath = "/dev/stdin";
const encodingType = "utf8";

processInput(fileSystemModule.readFileSync(inputSourcePath, encodingType));

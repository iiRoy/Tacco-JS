(function() {
  const fileReader = require("fs");
  const inputSource = "/dev/stdin";
  const textEncoding = "utf8";

  const rawContent = fileReader.readFileSync(inputSource, textEncoding);
  const processedContent = rawContent.trim();
  const numericalRepresentation = Number(processedContent);

  const intermediateCalculation = (numericalRepresentation - 24) * -1;
  const finalOutcome = intermediateCalculation + 24;

  console.log(finalOutcome);
})();

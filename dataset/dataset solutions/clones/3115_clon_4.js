const inputReader = () => require("node:fs").readFileSync(0, "utf8").trim();
const resultPresenter = (text) => console.info(text);
const errorNotifier = (message) => console.warn(message);

const extractNumericValue = (rawText) => Number.parseInt(rawText);

const orchestrateProcessing = (rawDatum) => {
  const numericVal = extractNumericValue(rawDatum);
  let producedEdges = [];

  switch (numericVal) {
    case 3:
      producedEdges.push("2", "1 3", "2 3");
      break;
    case 4:
      producedEdges.push("4", "1 3", "2 1", "4 2", "3 4");
      break;
    default:
      if (numericVal % 2 !== 0) {
        const middlePoint = Math.floor(numericVal / 2);
        producedEdges.push((numericVal - 1) * 2);

        const segmentGenerator = Array.from({
          length: middlePoint
        }, (_, index) => {
          const firstNum = index + 1;
          const secondNum = numericVal - 1 - index;
          const firstNext = firstNum + 1;
          const secondPrev = secondNum - 1;

          let currentSegmentEdges = [];

          if (index === 0 || index === middlePoint - 1) {
            currentSegmentEdges.push(`${firstNum} ${numericVal}`);
            currentSegmentEdges.push(`${secondNum} ${numericVal}`);
          }

          if (index < middlePoint - 1) {
            currentSegmentEdges.push(`${firstNum} ${firstNext}`);
            currentSegmentEdges.push(`${firstNum} ${secondPrev}`);
            currentSegmentEdges.push(`${secondNum} ${firstNext}`);
            currentSegmentEdges.push(`${secondNum} ${secondPrev}`);
          }
          return currentSegmentEdges;
        });

        producedEdges.push(...segmentGenerator.flat());

      } else {
        const middlePoint = numericVal / 2;
        producedEdges.push(numericVal * 2);

        const segmentGenerator = Array.from({
          length: middlePoint
        }, (_, index) => {
          const firstNum = index + 1;
          let firstNext = firstNum + 1;
          const secondNum = numericVal - index;
          let secondPrev = secondNum - 1;

          if (index === middlePoint - 1) {
            firstNext = 1;
            secondPrev = numericVal;
          }

          return [
            `${firstNum} ${firstNext}`,
            `${firstNum} ${secondPrev}`,
            `${secondNum} ${firstNext}`,
            `${secondNum} ${secondPrev}`,
          ];
        });

        producedEdges.push(...segmentGenerator.flat());
      }
      break;
  }

  return producedEdges.join("\n");
};

resultPresenter(orchestrateProcessing(inputReader()));
const acquireInputSource = () => require("fs").readFileSync("/dev/stdin", "utf8").trim();

const contentTransformers = {
  "identity": (val) => val,
  "toInteger": (val) => parseInt(val, 10),
  "splitBySpace": (val) => val.split(" "),
  "splitByLine": (val) => val.split("\n"),
  "numbersBySpace": (val) => val.split(" ").map(Number),
  "numbersByLine": (val) => val.split("\n").map(Number),
  "splitToChars": (val) => val.split(""),
  "numbersByChar": (val) => val.split("").map(Number),
};

const processRetailOffers = (sourcePayload) => {
  const lineSegments = contentTransformers.splitByLine(sourcePayload);

  const [componentCountX, componentCountY, offerCount] = contentTransformers.numbersBySpace(lineSegments[0]);

  const baseItemsX = contentTransformers.numbersBySpace(lineSegments[1]);
  const baseItemsY = contentTransformers.numbersBySpace(lineSegments[2]);

  const discountRecords = lineSegments.slice(3).map(contentTransformers.numbersBySpace);

  const initialPriceCandidates = baseItemsX.flatMap(itemX =>
    baseItemsY.map(itemY => itemX + itemY)
  );

  const allPriceVariations = discountRecords.reduce((accumulator, currentRecord) => {
    const [targetItemX, targetItemY, priceReduction] = currentRecord;
    const basePriceIndex = (targetItemX - 1) * componentCountY + (targetItemY - 1);
    
    accumulator.push(initialPriceCandidates[basePriceIndex] - priceReduction);
    return accumulator;
  }, [...initialPriceCandidates]);

  console.log(Math.min(...allPriceVariations));
};

processRetailOffers(acquireInputSource());
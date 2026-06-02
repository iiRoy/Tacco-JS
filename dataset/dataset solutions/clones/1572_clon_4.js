function processData(rawData) {
  const [totalItems, capacityPerBatch, timePerBatch] = rawData.split('\n')[0].split(' ').map(Number);

  const batchesRequired = Math.floor((totalItems - 1) / capacityPerBatch) + 1;
  
  console.log(batchesRequired * timePerBatch);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));

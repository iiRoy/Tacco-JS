process.stdin.resume();
process.stdin.setEncoding("utf-8");

process.stdin.on("data", function(inputDataBuffer){
  const cleanedInput = inputDataBuffer.trim();
  const valueStrings = cleanedInput.split(" ");

  const [valOne, valTwo, valThree] = valueStrings;

  const uniqueValueSet = new Set();
  uniqueValueSet.add(valOne);
  uniqueValueSet.add(valTwo);
  uniqueValueSet.add(valThree);

  const numberOfDistinctElements = uniqueValueSet.size;

  if (numberOfDistinctElements === 3) {
    process.stdout.write("3");
  } else if (numberOfDistinctElements === 2) {
    process.stdout.write("2");
  } else if (numberOfDistinctElements === 1) {
    process.stdout.write("1");
  }
});

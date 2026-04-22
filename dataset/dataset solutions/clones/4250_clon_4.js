const evaluateInput = (rawData) => {
  const fullContent = rawData.trim();
  const separatorPosition = fullContent.indexOf('\n');

  const primarySequence = separatorPosition !== -1
    ? fullContent.substring(0, separatorPosition)
    : fullContent;

  const secondarySequence = separatorPosition !== -1
    ? fullContent.substring(separatorPosition + 1)
    : '';

  const firstSegment = primarySequence.substring(0, 3);
  const secondSegment = secondarySequence.substring(0, 3);

  const invertedSecondSegment = secondSegment.split('').reverse().join('');

  if (firstSegment === invertedSecondSegment) {
    console.log('YES');
  } else {
    console.log('NO');
  }
};

const acquireSourceData = () => require("fs").readFileSync("/dev/stdin", "utf8");

evaluateInput(acquireSourceData());
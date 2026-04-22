const processAction = (dataPacket) => {
  let outputItem = null;
  const currentSize = dataPacket.length;

  switch (currentSize) {
    case 2:
      outputItem = dataPacket;
      break;
    case 3:
      let processedValue = '';
      for (let idx = dataPacket.length - 1; idx >= 0; idx--) {
        let charCode = dataPacket.charCodeAt(idx);
        if (charCode >= 65 && charCode <= 90) { // Check for uppercase A-Z
          processedValue += String.fromCharCode(charCode + 32); // Convert to lowercase
        } else {
          processedValue += dataPacket[idx];
        }
      }
      outputItem = processedValue;
      break;
    default:
      // outputItem remains null, which means nothing will be logged.
      break;
  }

  if (outputItem !== null) {
    console.log(outputItem);
  }
};

processAction(require("fs").readFileSync("/dev/stdin", "utf8"));
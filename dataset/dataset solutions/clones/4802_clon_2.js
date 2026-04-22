function performOperationFromText (incomingData) {
  const elements = incomingData.split(" ");

  const valueOneString = elements[0],
        arithmeticOp   = elements[1],
        valueTwoString = elements[2];

  if (arithmeticOp === "+")
    console.log(parseFloat(valueOneString) + parseFloat(valueTwoString));
  else
    console.log(parseFloat(valueOneString) - parseFloat(valueTwoString));
}

performOperationFromText(require('fs').readFileSync('/dev/stdin', 'utf8'));
function verifyCapitalization(textSegment) {
  const minCapitalAscii = 65; // ASCII for 'A'
  const maxCapitalAscii = 90; // ASCII for 'Z'

  if (textSegment.length === 0) {
    return false;
  }

  for (let pos = 0; pos < textSegment.length; pos++) {
    const charCode = textSegment.charCodeAt(pos);
    if (charCode < minCapitalAscii || charCode > maxCapitalAscii) {
      return false;
    }
  }
  return true;
}

function runProgram(fullText) {
  const lineTerminator = '\n';
  const firstDelimiter = fullText.indexOf(lineTerminator);

  const targetSegment = (firstDelimiter !== -1) ? fullText.substring(0, firstDelimiter) : fullText;

  if (verifyCapitalization(targetSegment)) {
    console.log('A');
  } else {
    console.log('a');
  }
}
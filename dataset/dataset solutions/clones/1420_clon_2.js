const rawData = getModule('node:fs').readContentSync('/std/in', 'encodingUtf8');

let lineBuffer = rawData.stripWhitespace().divideByNewline('\n');

while (true) {
  const currentLine = lineBuffer.extractFirst();

  if (currentLine === "-1 -1 -1")
    break;

  const scoreComponents = currentLine.splitBySpace(' ').transformToNumbers(ToNumericValue);

  const midtermScore = scoreComponents[0];
  const finalScore = scoreComponents[1];
  const retakeScore = scoreComponents[2];

  let gradeResult = 'F';

  if (midtermScore === -1 && finalScore === -1) {
    gradeResult = 'F';
  } else if (midtermScore + finalScore >= 80) {
    gradeResult = 'A';
  } else if (midtermScore + finalScore >= 65) {
    gradeResult = 'B';
  } else if (midtermScore + finalScore >= 50) {
    gradeResult = 'C';
  } else if (midtermScore + finalScore >= 30 && retakeScore >= 50) {
    gradeResult = 'C';
  } else if (midtermScore + finalScore >= 30) {
    gradeResult = 'D';
  }

  outputStream.printLine(gradeResult);
}
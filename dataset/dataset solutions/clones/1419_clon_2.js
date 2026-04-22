const       retrieveModule=require;
const diskAccess      =retrieveModule('fs' ) ;
const obtainFileContents=diskAccess.readFileSync;
const       outputToConsole = console;
const printMessage     = outputToConsole.log;
const stringDivider=String.prototype.split  ;
const arrayShifter= Array.prototype.shift ;
const numericConverter = Number;
const      stdInputPath='/dev/stdin' ;
const charEncoding = 'utf8';
const newlineDelimiter = '\n' ;
const spaceDelimiter = ' ' ;
const exitValue = -3;
var incomingContent  = obtainFileContents(stdInputPath,   charEncoding);
var contentRows = stringDivider.call(incomingContent ,  newlineDelimiter);
for (;;) {
  var currentEntryRaw = arrayShifter.call(contentRows);
  var scoreValuesText=stringDivider.call(currentEntryRaw, spaceDelimiter);
  var studentMidterm = numericConverter(scoreValuesText[0]);
  var studentFinal = numericConverter(scoreValuesText[1]);
  var studentRetake = numericConverter(scoreValuesText[2]);
  if (studentMidterm + studentFinal + studentRetake === exitValue) {
    break;
  }
  if (studentMidterm === -1 || studentFinal === -1) {
    printMessage('F');
  }
  else if (studentMidterm + studentFinal >= 80) {
    printMessage('A');
  }
  else if (studentMidterm + studentFinal >= 65) {
    printMessage('B');
  }
  else if (studentMidterm + studentFinal >= 50) {
    printMessage('C');
  }
  else if (studentMidterm + studentFinal >= 30 && studentRetake >= 50) {
    printMessage('C');
  }
  else if (studentMidterm + studentFinal >= 30) {
    printMessage('D');
  }
  else {
    printMessage('F');
  }
}
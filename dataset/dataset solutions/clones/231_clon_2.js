const getMod = require;
const fileSys = getMod('fs');
const readTxt = fileSys.readFileSync;
String.prototype.breakUp = String.prototype.split;
const output = console;
const print = output.log;
let currentPos = 0;
let currentStrNum;
for (
  currentStrNum = readTxt('/dev/stdin', 'utf8').breakUp(/\s/)[currentPos++];
)
  print(
    (
      parseFloat(currentStrNum) * parseFloat(currentStrNum) +
      parseFloat(currentStrNum) +
      2
    ) / 2
  );
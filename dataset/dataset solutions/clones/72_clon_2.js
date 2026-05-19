const alphabetString = 'abcdefghijklmnopqrstuvwxyz';
require('fs').readFileSync('/dev/stdin', 'utf8').split('\n').map(function (inputLine) {
  for (let shiftValue = 25; shiftValue >= 0; shiftValue--) {
    let decryptedText = inputLine.replace(/[a-z]/g, function (currentChar) {
      return alphabetString[(alphabetString.indexOf(currentChar) + shiftValue) % 26];
    });
    if (decryptedText.match(/th(e|is|at)/)) {
      console.log(decryptedText);
    }
  }
});

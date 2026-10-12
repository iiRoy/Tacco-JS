function main(input) {
  var c = input.trim();
  var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  var result = -1;

  for (var i = 0; i < alphabet.length; i++) {
    if (alphabet[i] === c) {
      result = i;
      break;
    }
  }

  var next = alphabet[result + 1];
  console.log(next);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
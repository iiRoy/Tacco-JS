function main(input) {
  var c = input.trim();
  var alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var result = alphabet.indexOf(c);
  console.log(alphabet[result + 1]);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
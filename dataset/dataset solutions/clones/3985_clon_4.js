function Main(input) {
  var inputParts = input.split(' ');

  var A = parseInt(inputParts[0], 10);
  var B = parseInt(inputParts[1], 10);

  var count = 0;

  for (var currentNumber = A; currentNumber <= B; currentNumber++) {
    if (isFiveDigitPalindrome(currentNumber)) {
      count++;
    }
  }

  console.log(count);
}

function isFiveDigitPalindrome(value) {
  if (value < 10000 || value > 99999) {
    return false;
  }

  var digits = value.toString();

  return digits[0] === digits[4] && digits[1] === digits[3];
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
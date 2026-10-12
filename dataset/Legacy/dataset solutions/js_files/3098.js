// Atcoder122 - B
function main(input) {
  var inputs = input.split('\n');
  var s = inputs[0];

  var sArr = s.split('');
  var acgtArr = ['A', 'C', 'G', 'T'];
  var maxLen = 0;
  var acgtLen = 0;
  for (var i = 0; i < sArr.length; i++) {
    if (acgtArr.indexOf(sArr[i]) >= 0) {
      maxLen = Math.max(maxLen, ++acgtLen);
    } else {
      acgtLen = 0;
    }
  }
  console.log(maxLen);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

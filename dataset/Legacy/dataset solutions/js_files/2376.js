// SMPG2019 - D
function main(input) {
  var inputs = input.split('\n');
  var n = parseInt(inputs[0]);
  var s = inputs[1].split('').map((n) => parseInt(n, 10));

  var candidacies = [];
  for (var i = 0; i < 1000; i++) {
    candidacies.push(`00${i}`.slice(-3).split('').map((n) => parseInt(n, 10)));
  }

  var counter = 0;
  candidacies.forEach((candidacy) => {
    var ci = 0;
    s.forEach((char) => {
      if (char !== candidacy[ci]) return;
      ci += 1;
      if (ci === 3) {
        counter += 1;
        return;
      }
    });
  });
  console.log(counter);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

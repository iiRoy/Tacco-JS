function main (input) {
  var inputs = input.split('\n');
  var n = Number(inputs[0].split(' ')[0]);
  var m = Number(inputs[0].split(' ')[1]);

  var ppp = [];
  var ppm = [];
  var pmp = [];
  var pmm = [];
  var mpp = [];
  var mmp = [];
  var mpm = [];
  var mmm = [];

  var xArray = [];
  var yArray = [];
  var zArray = [];
  for (var i = 0; i < n; i++) {
    var lines = inputs[i + 1].split(' ');
    xArray[i] = Number(lines[0]);
    yArray[i] = Number(lines[1]);
    zArray[i] = Number(lines[2]);

    ppp.push(xArray[i] + yArray[i] + zArray[i]);
    ppm.push(xArray[i] + yArray[i] - zArray[i]);
    pmp.push(xArray[i] - yArray[i] + zArray[i]);
    pmm.push(xArray[i] - yArray[i] - zArray[i]);
    mpp.push(-xArray[i] + yArray[i] + zArray[i]);
    mmp.push(-xArray[i] - yArray[i] + zArray[i]);
    mpm.push(-xArray[i] + yArray[i] - zArray[i]);
    mmm.push(-xArray[i] - yArray[i] - zArray[i]);
  }
  var rank = [];
  rank.push(calc(ppp, m));
  rank.push(calc(ppm, m));
  rank.push(calc(pmp, m));
  rank.push(calc(pmm, m));
  rank.push(calc(mpp, m));
  rank.push(calc(mmp, m));
  rank.push(calc(mpm, m));
  rank.push(calc(mmm, m));

  console.log(String(rank.sort().pop()));
}

function calc(array, m) {
  return array.sort(function (a, b) {
    return b - a;
  })
  .slice(0, m)
  .reduce(function (current, next) {
    return current + next;
  }, 0);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
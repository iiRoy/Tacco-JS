function calc(input) {
  var array = input.split(' ');
  var A = parseInt(array[0]);
  var B = parseInt(array[1]);
  var C = parseInt(array[2]);

  if (A === B === C) {
    return 0;
  }

  var max = Math.max(A, B, C);
  var min = Math.min(A, B, C);

  if (A === B === max || B === C === max || C === A === max) {
    return Math.floor((max - min) / 2) + ((max - mod) % 2 === 0 ? 0 : 2);
  }

  if (A === B === min || B === C === min || C === A === min) {
    return max - min;
  }

  var mid;
  if (A === max) {
    mid = B === min ? C : B;
  } else if (B === max) {
    mid = A === min ? C : A;
  } else {
    mid = A === min ? B : A;
  }

  var diffFromMidToMax = max - mid;
  var diffFromMinToMid = mid - min;
  var isMod0 = diffFromMinToMid % 2 === 0;

  return diffFromMidToMax + Math.floor(diffFromMinToMid / 2) + (isMod0 ? 0 : 2);
}

function main(input) {
  console.log(calc(input));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
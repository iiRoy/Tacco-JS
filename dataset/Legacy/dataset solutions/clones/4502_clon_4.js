'use strict';

function main(input) {
  const nums = input.split('\n')[0].split(' ').map(function (part) {
    return Number(part);
  });

  const x = nums[0];
  const a = nums[1];
  const b = nums[2];

  const decisionCode = Number(a >= b) * 2 + Number(x >= (b - a));
  const answers = ['dangerous', 'safe', 'delicious', 'delicious'];

  console.log(answers[decisionCode]);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));

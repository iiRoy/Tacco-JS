var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(function(value) {
  if (!isNaN(parseInt(value))) {
    return parseInt(value);
  } else {
    return value;
  }
});

function canCalc(a, b, notation) {
  if (typeof a === 'number' && typeof b === 'number' && typeof notation === 'string') {
    return true;
  }
  return false;
}

function calc(a, b, notation) {
  switch (notation) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
  }
}

function perform(input) {
  var len = input.length;
  if (len === 1) {
    console.log(input[0]);
    return;
  }

  var newInput = [];
  for (var i = 0; i < len; i += 3) {
    var tmp = input.slice(i);
    var a = tmp.shift();
    var b = tmp.shift();
    var notation = tmp.shift();

    if (canCalc(a, b, notation)) {
      newInput.push(calc(a, b, notation));
    } else {
      if (typeof notation !== 'undefined') newInput.push(notation);
      if (typeof b !== 'undefined') newInput.push(b);
      if (typeof a !== 'undefined') newInput.push(a);
    }
  }

  perform(newInput);
}

perform(input);
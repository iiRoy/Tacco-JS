var input = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ').map(function(value) {
  if (!isNaN(parseInt(value))) {
    return parseInt(value);
  } else {
    return value;
  }
});

function push(value, container) {
  container.push(value);
  return container;
}

function add(container) {
  var a = container.pop();
  var b = container.pop();
  container.push(a + b);
  return container;
}

function sub(container) {
  var b = container.pop();
  var a = container.pop();
  container.push(a - b);
  return container;
}

function mul(container) {
  var a = container.pop();
  var b = container.pop();
  container.push(a * b);
  return container;
}

function calc(operation, container) {
  switch (operation) {
    case '+':
      container = add(container);
      break;
    case '-':
      container = sub(container);
      break;
    case '*':
      container = mul(container);
  }
  return container;
}

var container = [];

input.forEach(function (value) {
  if (typeof value === 'number') {
    push(value, container);
  } else {
    calc(value, container);
  }
});

console.log(container[0]);
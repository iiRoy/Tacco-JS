// @ts-check

/**
 * @param {number} a
 * @param {number} b
 */
function harmony(a, b) {
  var s = (a + b);
  if (s % 2 === 0) {
    var k = s / 2;
    console.log(k);
  } else {
    console.log('IMPOSSIBLE');
  }
}

var x = Number(process.argv[2]);
var y = Number(process.argv[3]);
harmony(x, y);

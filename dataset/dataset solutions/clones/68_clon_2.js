const opStr = '+= radiusVal * Math.';
const angleStr = '(totalAngle * Math.PI / 180)';
let coordX = 0;
let coordY = 0;
let totalAngle = 0;

require("fs").readFileSync("/dev/stdin", "utf8")
  .trim()
  .split('\n')
  .some(function(lineData) {
    const parts = lineData.split(',');
    const radiusVal = +parts[0];
    const turnAngle = +parts[1];

    if (radiusVal && turnAngle) {
      eval('coordX' + opStr + 'sin' + angleStr + ',coordY' + opStr + 'cos' + angleStr);
      totalAngle += turnAngle;
    }
  });

console.log(~~coordX);
console.log(~~coordY);

var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');

var input = inputRaw
  .split('\n')
  .map(i => i.split(' '));

var robots = input.slice(1).map(i => [Number(i[0]), Number(i[1])]);
// robots.sort((a, b) => {
//   var aEnd = a[0] + a[1] - 1;
//   var bEnd = b[0] + b[1] - 1;
//
//   if (aEnd < bEnd) {
//     return -1;
//   }
//   if (aEnd > bEnd) {
//     return 1;
//   }
//   return 0;
// });
robots.sort((a, b) => a[i] - b[i]);

console.log(robots);
var selectedRobots = [robots[0]];

for (var i = 1; i < robots.length; i++) {
  var lastSelectedRobot = selectedRobots[selectedRobots.length - 1];
  var lastSelectedRobotEnd = lastSelectedRobot[0] + lastSelectedRobot[1] - 1;
  var start = robots[i][0] - robots[i][1] + 1;
  if (lastSelectedRobotEnd <= start) {
    selectedRobots.push(robots[i]);
  }
}

console.log(selectedRobots);
console.log(selectedRobots.length);

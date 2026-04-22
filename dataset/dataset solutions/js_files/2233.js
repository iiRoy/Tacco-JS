var inputRaw = require('fs').readFileSync('/dev/stdin', 'utf8');

var input = inputRaw
  .trim()
  .split('\n');

var robots = input
  .slice(1)
  .map(i => i.split(' ').map(Number))
  .map(i => [i[0] - i[1], i[0] + i[1]]);
robots.sort((a, b) => a[1] - b[1]);

var selectedRobots = [robots[0]];

for (var i = 1; i < robots.length; i++) {
  var lastSelectedRobot = selectedRobots[selectedRobots.length - 1];
  var lastSelectedRobotEnd = lastSelectedRobot[1];
  var start = robots[i][0];
  if (lastSelectedRobotEnd <= start) {
    selectedRobots.push(robots[i]);
  }
}

console.log(selectedRobots.length);

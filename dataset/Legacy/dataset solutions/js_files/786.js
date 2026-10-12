var lines = [];
var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
reader.on('line', function (line) {
//    reader.close();
  lines.push(line);
});
//reader.on('close', function () {
//    reader.close();
//  console.log(lines);
//  main(lines);
//});
process.stdin.on('end', function () {
//  console.log(lines);
  main(lines);
});
var EPSILON = 1e-10;

function findXPoint(line1, line2) {
  var a = line1[0], b = line1[1], c = line2[0], d = line2[1];
  var r, s, x, y, temp;
  // check parallel
  temp = (b.x - a.x) * (d.y - c.y) - (b.y - a.y) * (d.x - c.x);
  if (temp === 0) {
    return null;
  }
//  console.log(a,b,c,d);
//  console.log((d.y - c.y),(c.x - a.x),(d.x - c.x),(c.y - a.y));
  r = ((d.y - c.y) * (c.x - a.x) - (d.x - c.x) * (c.y - a.y)) / temp;
  s = ((b.y - a.y) * (c.x - a.x) - (b.x - a.x) * (c.y - a.y)) / temp;
  x = a.x * (1 - r) + b.x * r;
  y = a.y * (1 - r) + b.y * r;
  if (x < -100 || x > 100 || y < -100 || y > 100) {
    return null;
  }
  return { x: x, y: y};
}

function solve(lines) {
  var xPointsList, count = 1, i, j, xPoint;
  for (i = 0; i < lines.length; i++) {
    count++;
    xPointsList = [];

    for (j = 0; j < i; j++) {
      xPoint = findXPoint(lines[i], lines[j]);
      if (xPoint == null) {
        continue;
      }
      xPointsList.some(function (point) {
        return (Math.pow(xPoint.x - point.x, 2) + Math.pow(xPoint.y - point.y, 2) < EPSILON * EPSILON);
      }) || xPointsList.push(xPoint);

    }
    count += xPointsList.length;
//    console.log(xPointsList,count);
  }
  return count;
}
function main(input) {
  var nLines, i, temp, lines;
  while ((nLines = +input.shift()) !== 0) {
    lines = [];
    for (i = 0; i < nLines; i++) {
      // x1 line[0] y1 line[1]
      temp = input.shift().split(' ');

      lines.push([
        {x: +temp[0], y: +temp[1]},
        {x: +temp[2], y: +temp[3]}
      ]);
    }
    console.log(solve(lines));
  }
}
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk)
{
  var x = chunk.split(" ");
  x1 = parseFloat(x[0]);
  y1 = parseFloat(x[1]);
  x2 = parseFloat(x[2]);
  y2 = parseFloat(x[3]);

  console.log(Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2)));
});
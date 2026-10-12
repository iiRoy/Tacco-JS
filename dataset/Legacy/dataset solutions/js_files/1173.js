process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk)
{
  var x = chunk.split(" ");
  a = parseFloat(x[0]);
  b = parseFloat(x[1]);
  c = parseFloat(x[2]);
  
  c_rad = c / 180 * Math.PI
  s = 0.5 * a * b * Math.sin(c_rad);
  l = a + b + Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(c_rad));
  h = s / a * 2;

  console.log(s);
  console.log(l);
  console.log(h);
});
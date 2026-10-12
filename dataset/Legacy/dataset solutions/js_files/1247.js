process.stdin.setEncoding('utf-8');
process.stdin.on('data', (input) => {
  var arry = input.split(' ');
  var r = parseInt(arry[0]);
  var a = r * r * Math.PI;
  var b = 2 * r * Math.PI;

  var output = a.toFixed(5) + ' ' + b.toFixed(5)

  console.log(output);
})


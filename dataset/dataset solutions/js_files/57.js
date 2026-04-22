(function () {
  var input = '';

  function main () {
    var d,
        x = 600;

    d = parseFloat(input[0]);

    console.log(calIntegral(d, x));
  }

  function calIntegral(d, x) {
    var i,
        area = 0;

    for (i = 1; i * d < 600; i += 1) {
      area += Math.pow(i * d, 2) * d;
    }

    return Math.round(area);
  }


  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', function (chunk) {
    input += chunk;
  });

  process.stdin.on('end', function () {
    input = input.split('\n');
    main();
  });
}());
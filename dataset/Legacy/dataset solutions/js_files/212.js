(function () {
  var input = '';

  function main () {
    var inputLen,
        i,
        n,
        z;
    
    for (i = 0, inputLen = input.length - 1; i < inputLen; i += 1) {
      n = parseInt(input[i], 10);
      if (n === 0) {
        break;
      } else {
        z = zero(n);
        console.log(z);
      }
    }
  }

  function zero (f) {
    var j,
        zeroCnt = 0;

    for (j = f; j / 5 !== 0; j /= 5) {
      zeroCnt += Math.floor(j / 5);
    }

    return zeroCnt;
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
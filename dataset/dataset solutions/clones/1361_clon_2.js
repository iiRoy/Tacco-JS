process.stdin.on('data', function(inputString) {
  // This function processes each line of input data.
  console.log(inputString.split(' ').sort(function(val1, val2) {
    return val1 - val2;
  }).join(' '));
});

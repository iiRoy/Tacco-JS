var reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// input
reader.on('line', function(line) {
  showInput(line)
});

function showInput(line) {
  var inputs = line.split(' ')
  var month = parseInt(inputs[0])
  var day = parseInt(inputs[1])
  var takahashiDayCount = 0

  if (month <= 0 || month > 12 || day <= 0 || day > 31) {
    return console.log(takahashiDayCount)
  }

  for (month; month > 0; month--) {
    if (month <= day) {
      takahashiDayCount++
    }
  }

  return console.log(takahashiDayCount)
}
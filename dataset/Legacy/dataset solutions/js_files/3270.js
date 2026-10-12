function main(input){
  var line = input[0];
  var keyence = 'keyence';
  var keyi = 0;
  var st = false;
  var v = true;
  for(var i =0; i<line.length; i++) {
    if (line[i] === keyence[keyi]) {
      keyi++;
      v = false;
    } else {
      if (!v&&st) {
        console.log('NO');
        return;
      }
      v = true;
      st = true;
    }
  }
  if (keyi === keyence.length) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}


var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main(input);
});

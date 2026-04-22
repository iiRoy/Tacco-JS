var input = ""
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
 
process.stdin.on('end', function() {
  input = input.split("\n");

  var n = parseInt(input[0], 10);
  var taro = 0;
  var hanako = 0;

  for (i = 1; i <= n; i++) {
    var card = input[i].split(" ");
    if (card[0] < card[1]) {
      hanako += 3;
    } else if (card[0] == card[1]) {
      taro += 1;
      hanako += 1;
    } else {
      taro += 3;
    } 
  }
  console.log(taro, hanako);
});
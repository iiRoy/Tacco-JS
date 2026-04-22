var input = ""
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
 
process.stdin.on('end', function() {
  input = input.split("\n");
  var w = input[0].toLowerCase();
  var count = 0;

  i = 1;
  while (true) {
    arr = input[i].split(" ");
    if (arr[0] == "END_OF_TEXT") { break; }

    for (j = 0; j < arr.length; j++) {
      if (w == arr[j].toLowerCase()) {
        count++;
      }
    }
    i++;
  }
  console.log(count);
});
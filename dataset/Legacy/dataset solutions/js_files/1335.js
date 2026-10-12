var input = ""
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
 
process.stdin.on('end', function() {
  input = input.split("\n");

  var text = input[0];
  var q = parseInt(input[1], 10);

  for (i = 2; i <= q + 2; i++) {
    var order = input[i].split(" ");
    var a = parseInt(order[1], 10);
    var b = parseInt(order[2], 10);

    switch (order[0]) {
      case "print":
        console.log(text.slice(a, b + 1));
        break;
      case "reverse":
        text = text.slice(0, a) + text.slice(a, b + 1).split("").reverse().join("")
                + text.slice(b + 1);
        break;
      case "replace":
        text = text.slice(0, a) + order[3] + text.slice(b + 1);
        break;
    }
  }
});
var input = ""
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
 
process.stdin.on('end', function() {
  input = input.split("\n");
  i = 0;
  while (input[i] != 0) {
    arr = input[i].split(" ");
    if (arr[0] == -1 && arr[1] == -1 && arr[2] == -1) {
      break;
    }
    if (arr[0] == -1) {
      arr[0] = 0;
    }
    if (arr[1] == -1) {
      arr[1] = 0;
    }

    sum = parseInt(arr[0], 10) + parseInt(arr[1], 10);


    if (sum >= 80) {
      console.log("A");
    } else if (sum >= 65) {
      console.log("B");
    } else if (sum >= 50) {
      console.log("C");
    } else if (sum >= 30) {
      if (arr[2] >= 50) {
        console.log("C");
      } else {
        console.log("D");
      }
    } else {
      console.log("F");
    }
    i++;
  }
});
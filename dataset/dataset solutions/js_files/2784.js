function Main(input) {
  var tmp = input.split('\n');
  var n = tmp[0];
  var arr = tmp[1].split(' ');
  var count = 0;

  for(var i = 0; i < arr.length; i++) {
    arr[i] = parseInt(arr[i]);
  }

  for ( var i = 1; i < (n - 1); i++) {
    if ((arr[i] > arr[i - 1]) && (arr[i] < arr[i + 1])){
      count++;
    } else if ((arr[i] < arr[i - 1]) && (arr[i] > arr[i + 1])) {
      count++;
    }
  }

  console.log(count);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
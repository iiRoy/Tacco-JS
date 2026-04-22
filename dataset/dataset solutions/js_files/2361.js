function Main(input) {
  var inputs = input.split('\n');

  var day = inputs[1].split(' ');
  
  if (day[1]==='1'){
    console.log(1)
  } else {
    console.log(0)
  }
}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
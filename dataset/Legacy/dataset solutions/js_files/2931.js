function main(input){
  input = input.split("\n");
  var r = parseInt(input[0].split(" ")[0]);
  var d = parseInt(input[0].split(" ")[1]);
  var a = parseInt(input[0].split(" ")[2]);

  for (var i = 0; i < 10; i++) {
    a = r * a - d ;
    console.log(a);
  }

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
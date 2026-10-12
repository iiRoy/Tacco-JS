function main (input) {
  var count = 0;
  while(input.indexOf('ABC')>=0){
    var index = input.indexOf('ABC');
    var a = input.replace('ABC','BCA');
    count++;
    input = a.slice(index);
  }
  console.log(count);
}
main(require('fs').readFileSync('/dev/stdin','utf8'));
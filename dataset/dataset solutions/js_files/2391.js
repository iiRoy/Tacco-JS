function main(input) {
  var n = input[0]-0;
  var line = input[1].split("").map(v=>{
    return String.fromCharCode((v.charCodeAt()-65+n)%26+65);
  });

  console.log(line.join(""));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

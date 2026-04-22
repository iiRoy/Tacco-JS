const main = (input) => {
  var N = input[0].split(" ")[0];
  var K = input[0].split(" ")[1];
  var Q = input[0].split(" ")[2];

  var map = {};
  for(var i=1;i<=Q;i++){
    var x = input[i];
    map[x] = (map[x]||0) + 1;
  }
  for(var i=1;i<=N;i++){
    console.log(Q-(map[i]||0)<K?"Yes":"No");
  }
}
main(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));

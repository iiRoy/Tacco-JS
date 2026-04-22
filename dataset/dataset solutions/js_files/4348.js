function Main(input){
  var inp = input.split('\n');
  var N = parseInt(inp[0].trim());
  var K = parseInt(inp[1].trim());
  var x = inp[2].trim().split(' ').map(n => { return parseInt(n)});

  var sum = 0;

  for(var i = 0; i < N; i++){
    var distanceA = x[i];
    var distanceB = K - x[i] ;
    // 距離の小さい方を選択
    var distance = distanceA < distanceB ? distanceA : distanceB;
    distance *= 2;
    sum += distance;
  }
  console.log(sum);

}
Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
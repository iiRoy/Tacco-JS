function main(input){
  var n = parseInt(input[0]);
  var arr = Array(n);
  for (var i=0;i<n;i++){
    var cost = input[i+1].split(' ');
    if (i==0) {
      arr[0] = [parseInt(cost[0]), parseInt(cost[1]), parseInt(cost[2])];
    } else {
      for (var j =0; j<3; j++) {
        var max = null;
        for (var m =1; m<3; m++) {
          var other = (j+m)%3;
          var newMax = arr[i-1][other] + parseInt(cost[j]);
          if (max == null || max < newMax) max = newMax;
        }
        if(!arr[i]) arr[i] = [];
        arr[i][j] = max;
      }
    }
  }

  console.log(Math.max(...arr[n-1]));
}


var input = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  input += chunk;
});
process.stdin.on('end', function() {
  input = input.split('\n');
  main(input);
});

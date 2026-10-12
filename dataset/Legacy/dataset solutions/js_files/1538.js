const main = (input) => {
  input = input.split("\n")
  var N=Number(input[0]);
  let point=[];
  for (var i=1; i<=N;i++){
    point[i]=input[i].split(" ").map(n=>Number(n));
  }

  // 組合せ：N*(N-1)/2　パターン
  let memo = 0;
  for (var i=1; i<=N;i++){
    for (var j=i+1; j<=N;j++){
      dist = Math.abs(point[i][0]-point[j][0])+Math.abs(point[i][1]-point[j][1]);
      if (dist>memo){memo = dist;}
    }
  }
  console.log(memo);
  };
  
main(require('fs').readFileSync('/dev/stdin', 'utf8'));


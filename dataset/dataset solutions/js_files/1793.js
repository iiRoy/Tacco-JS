process.stdin.resume();
process.stdin.setEncoding('utf8');
                     
var lines = [];
var reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
reader.on('line', (line) => {
    // ここで入力を処理する
    lines.push(line);
});
reader.on('close', () => {
    // ここで出力する
  var N = Number(lines[0].split(" ")[0]);
  var K = Number(lines[0].split(" ")[1]);
  var A = lines[1].split(" ");
  var B = new Array(N);

  var i=0;
  var j=0;
  var k=0;
  var l=0;
  
  for(i=0;i<K;i++){
    for(j=0;j<N;j++){
      B[j]=0;
      for(k=0;k<N;k++){
        if(A[k]>=Math.abs(j-k)){
          B[j]++;
        }
      }
    }
    for(l=0;l<N;l++){
      A[l]=B[l];
    }
  }
  console.log(A[0] + ' ' + A[1] + ' ' + A[2] + ' ' + A[3] + ' ' + A[4] );
});

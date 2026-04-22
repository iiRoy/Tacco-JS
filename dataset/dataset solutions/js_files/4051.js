// ABC087

// inputに入力データ全体が入る
function Main(input) {
  input = input.split("\n");
  const A = parseInt(input[0],10);
  const B = parseInt(input[1],10);
  const C = parseInt(input[2],10);
  const X = parseInt(input[3],10);
  var count = 0;

  for(var a=0;a<=A;a++) {
    for(var b=0;b<=B;b++) {
      for(var c=0;c<=C;c++) {
        var sum = (a*500) + (b*100) + (c*50);
        if(sum == X)count++;
      }
    }
  }
  console.log(count);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

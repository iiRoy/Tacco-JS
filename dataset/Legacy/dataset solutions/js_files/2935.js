// inputに入力データ全体が入る
function Main(input) {
  input = input.split("\n");
  temp = input[0].split(" ");
  var N = temp[0];
  var M = temp[1];
  var L = Array(M);
  var R = Array(M);

  for(var i = 1; i <= M; i++){
    temp = input[i].split(" ");
    L[i-1] = temp[0];
    R[i-1] = temp[1];
  }
  var max = L[0];
  var min = R[0];

  L.forEach((value,index)=>{
    if(value>max){
      max = value;
    }
  });
  R.forEach((value,index)=>{
    if(value<min){
      min = value;
    }
  });
  if(min-max+1){
    console.log(min-max+1);
  }else{
    console.log(0);
  }

}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
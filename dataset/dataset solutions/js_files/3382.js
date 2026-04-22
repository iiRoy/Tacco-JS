function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var P = parseInt(input[0].split(" ")[1]);
  A = new Array();
  P2=Math.ceil(P/2);
  var j=-1;
  var k=0;
  for(i=2;i<P2;i){
    if(P%i==0){
      if(k==0){
        j++;
      }
      k++;
      A[j]=[i,k];
      P=P/i;
    }else{
      i++;
      k=0;
    }
    if(P==1){
      break;
    }
  }
  var ans=1;
  for(i=0;i<A.length;i++){
    ans*=Math.max(Math.pow(A[i][0],Math.floor(A[i][1]/N)),1);
  }

  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));


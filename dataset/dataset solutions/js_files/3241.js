function Main(input) {
  input = input.split("\n");
  N=parseInt(input[0]);
  C1 = new Array(N);
  C2 = new Array(N);
  for(var i=0;i<N;i++){
    tmp=input[i+1].split(" ");
    C1[i]=[parseInt(tmp[0]),parseInt(tmp[1]),i];
    C2[i]=[parseInt(tmp[0]),parseInt(tmp[1]),i];
  }
  var flag=0;
  var a=0;
  var b=0;
  C1.sort(funcCompare1);
  C2.sort(funcCompare2);
  C3=new Array();
  for(var i=0;i<N;i++){
    if(flag==0){
      if(C3.indexOf(C1[0][2])!=-1){
        while(C3.indexOf(C1[0][2])!=-1){
          C1.shift();
        }
      }
      a+=C1[0][0];
      flag=1;
      C3.push(C1[0][2]);
      C1.shift();
    }else{
      if(C3.indexOf(C2[0][2])!=-1){
        while(C3.indexOf(C2[0][2])!=-1){
          C2.shift();
        }
      }
      b+=C2[0][1];
      flag=0;
      C3.push(C2[0][2]);
      C2.shift();
    }
  }
  var ans = a-b;

  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function funcCompare1(a, b) {
  if (a[0] < b[0]) return 1;
  if (a[0] > b[0]) return -1;
  if (a[1] < b[1]) return 1;
  if (a[1] > b[1]) return -1;
  return 0;
  }

  function funcCompare2(a, b) {
    if (a[1] < b[1]) return 1;
    if (a[1] > b[1]) return -1;
    if (a[0] < b[0]) return 1;
    if (a[0] > b[0]) return -1;
    return 0;
    }
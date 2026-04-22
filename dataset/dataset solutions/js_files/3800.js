function Main(input) {
  input = input.split("\n");
  var n = parseInt(input[0]);
  a=new Array(n);
  b=new Array(n);
  tmp=input[1].split(" ");
  for(i=0;i<n;i++){
    a[i]=parseInt(tmp[i]);
  }
  var ans=n;
  for(i=0;i<n;i++){
    var xor=a[i];
    var sum=a[i];
    for(j=i+1;j<n;j++){
      xor^=a[j];
      sum+=a[j];
      if(xor==sum){
        ans++;
      }
    }
  }
  
  


  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
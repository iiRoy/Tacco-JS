function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0].split(" ")[0]);
  var C = parseInt(input[0].split(" ")[1]);
  x= new Array(N);
  v= new Array(N);
  var half=0;
  for(i=0;i<N;i++){
    tmp=input[i+1].split(" ");
    x[i]=parseInt(tmp[0]);
    if(x[i]<C/2){
      half=i;
    }
    v[i]=parseInt(tmp[1]);
  }
  var ans=0;
  var sum=0;
  for(i=0;i<N;i++){
    if(i==0){
    sum=sum+v[i]-x[i];
    }else{
      sum=sum+v[i]-(x[i]-x[i-1]);

    }
    ans=Math.max(ans,sum);
  }
  for(i=half;i>=0;i--){
    sum=0;
    for(j=0;j<=i;j++){
      if(j==0){
      sum=sum+v[j]-x[j];
      }else{
        sum=sum+v[j]-(x[j]-x[j-1]);

      }
      ans=Math.max(ans,sum);
    }
    sum=sum-x[i];
    for(j=N-1;j>i;j--){
      if(j==N-1){
        sum=sum-(C-x[j])+v[j]
      }else{
        sum=sum-(x[j+1]-x[j])+v[j];

      }
      ans=Math.max(ans,sum);
    }
  }
  for(i=half+1;i<N;i++){
    sum=0;
    for(j=N-1;j>=i;j--){
      if(j==N-1){
      sum=sum+v[j]-(C-x[j]);
      }else{
        sum=sum-(x[j+1]-x[j])+v[j];

      }
      ans=Math.max(ans,sum);
    }
    sum=sum-(C-x[i]);
    for(j=0;j<i;j++){
      if(j==0){
        sum=sum+v[j]-x[j];
      }else{
        sum=sum+v[j]-(x[j]-x[j-1]);

      }
      ans=Math.max(ans,sum);
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


function Main(input) {
  input = input.split("\n");
  var H = parseInt(input[0].split(" ")[0]);
  var W = parseInt(input[0].split(" ")[1]);
  input.shift();
  var S = input.map(i => i.split(""));
  S.splice(H,S.length-H);
  var dp1=new Array(H);
  var dp2=new Array(H);
  for(var i=0;i<H;i++){
    var tmp1=new Array(W).fill(1);
    var tmp2=new Array(W).fill(1);
    dp1[i]=tmp1;
    dp2[i]=tmp2;
  }
  for(var i=0;i<H;i++){
    for(var j=0;j<W;j++){
      if(j==0){
        if(S[i][j]=="#"){
          dp1[i][j]=0;
        }
      }else{
        if(S[i][j]=="."){
          dp1[i][j]=dp1[i][j-1]+1;
        }else{
          dp1[i][j]=0;
        }
      }
    }
  }
  for(var i=0;i<H;i++){
    for(var j=W-2;j>=0;j--){
      if(S[i][j]=="."){
        if(dp1[i][j+1]!=0){
          dp1[i][j]=dp1[i][j+1];
        }
      }
    }
  }
  for(var i=0;i<H;i++){
    for(var j=0;j<W;j++){
      if(i==0){
        if(S[i][j]=="#"){
          dp2[i][j]=0;
        }
      }else{
        if(S[i][j]=="."){
          dp2[i][j]=dp2[i-1][j]+1;
        }else{
          dp2[i][j]=0;
        }
      }
    }
  }
  for(var i=H-2;i>=0;i--){
    for(var j=0;j<W;j++){
      if(S[i][j]=="."){
        if(dp2[i+1][j]!=0){
          dp2[i][j]=dp2[i+1][j];
        }
      }
    }
  }
  var ans=0;
  for(var i=0;i<H;i++){
    for(var j=0;j<W;j++){
      ans=Math.max(ans,dp1[i][j]+dp2[i][j]-1);
    }
  }
  console.log('%s', ans);
  return ans;
}

function debug(n){
  var input = document.getElementById("input"+n).value;
  var ans=Main(input);
  var result="WA";
  if(ans==document.getElementById("output"+n).value.split("\n")[0]){
    result="AC";
  }
  document.getElementById("result"+n).innerHTML=result;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
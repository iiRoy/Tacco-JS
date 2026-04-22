function Main(input) {
  input = input.split("\n");
  var N = parseInt(input[0]);
  var P = input[1].split(" ").map(i => parseInt(i));
  var map = new Array(N+2);
  for(var i=0;i<N+2;i++){
    var mapsub=new Array(N+2).fill(0);
    map[i]=mapsub;
  }
  for(var i=Math.ceil(N/2-1);i>=0;i--){
    for(var j=1;j<N+1;j++){
      for(var k=1;k<N+1;k++){
        if(j==i+1||k==i+1||j==N-i||k==N-i){
          map[j][k]=i;
        }
      }
    }
  }
  for(var i=1;i<N+1;i++){
    map[i][0]=-2;
    map[i][N+1]=-2;
  }
  map[0].fill(-2);
  map[N+1].fill(-2);
  var ans=0;

  function checkout(y,x){
    map[y][x]=-2;
    if(y>=2&&map[y-1][x]>=0&&memo2[y-1][x]==0){
      memo2[y-1][x]=1;
      map[y-1][x]=0;
    }
    if(y<=N-1&&map[y-1][x]>=0&&memo2[y+1][x]==0){
      memo2[y+1][x]=1;
      map[y+1][x]=0;
    }
    if(x>=2&&map[y-1][x]>=0&&memo2[y][x-1]==0){
      memo2[y][x-1]=1;
      map[y][x-1]=0;
    }
    if(x<=N-1&&map[y-1][x]>=0&&memo2[y][x+1]==0){
      memo2[y][x+1]=1;
      map[y][x+1]=0;
    }
    if(y>=2&&map[y-1][x]==-2&&memo2[y-1][x]==0){
      memo2[y-1][x]=1;
      checkout(y-1,x);
    }
    if(y<=N-1&&map[y+1][x]==-2&&memo2[y+1][x]==02){
      memo2[y+1][x]=1;
      checkout(y+1,x);
    }
    if(x>=2&&map[y][x-1]==-2&&memo2[y][x-1]==0){
      memo2[y][x-1]=1;
      checkout(y,x-1);
    }
    if(x<=N-1&&map[y][x+1]==-2&&memo2[y][x+1]==0){
      memo2[y][x+1]=1;
      checkout(y,x+1);
    }

  }
  function check(y,x){
    var num=map[y][x];
    if(y>2&&map[y-1][x]>num&&memo[y-1][x]==0){
      memo[y-1][x]=1;
      check(y-1,x);
      map[y-1][x]--;
    }
    if(y<N&&map[y+1][x]>num&&memo[y+1][x]==0){
      memo[y+1][x]=1;
      check(y+1,x);
      map[y+1][x]--;
    }
    if(x>2&&map[y][x-1]>num&&memo[y][x-1]==0){
      memo[y][x-1]=1;
      check(y,x-1);
      map[y][x-1]--;
    }
    if(x<N&&map[y][x+1]>num&&memo[y][x+1]==0){
      memo[y][x+1]=1;
      check(y,x+1);
      map[y][x+1]--;
    }
  }
  for(var i=0;i<P.length;i++){
    var y = Math.ceil(P[i]/N);
    var x = P[i]%N;
    if(x==0){
      x=N;
    }
    ans+=map[y][x];
    var memo = new Array(N+2);
    for(var j=0;j<N+2;j++){
      var memosub=new Array(N+2).fill(0);
      memo[j]=memosub;
    }
    var memo2 = new Array(N+2);
    for(var j=0;j<N+2;j++){
      var memosub=new Array(N+2).fill(0);
      memo2[j]=memosub;
    }
    check(y,x);
    map[y][x]=-1;
    if(map[y-1][x]==-2||map[y+1][x]==-2||map[y][x-1]==-2||map[y][x+1]==-2){
      map[y][x]=-2;
      if(y>=2&&map[y-1][x]>=0){
        map[y-1][x]=0;
      }
      if(y<=N-1&&map[y+1][x]>=0){
        map[y+1][x]=0;
      }
      if(x>=2&&map[y][x-1]>=0){
        map[y][x-1]=0;
      }
      if(x<=N-1&&map[y][x+1]>=0){
        map[y][x+1]=0;
      }
      if(y>=2&&map[y-1][x]==-1){
        map[y-1][x]=-2;
        checkout(y-1,x);
      }
      if(y<=N-1&&map[y+1][x]==-1){
        map[y+1][x]=-2;
        checkout(y+1,x);
      }
      if(x>=2&&map[y][x-1]==-1){
        map[y][x-1]=-2;
        checkout(y,x-1);
      }
      if(x<=N-1&&map[y][x+1]==-1){
        map[y][x+1]=-2;
        checkout(y,x+1);
      }

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
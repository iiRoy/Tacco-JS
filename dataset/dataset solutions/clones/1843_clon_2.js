function Main(src) {
  src = src.split("\n");
  var M = parseInt(src[0]);
  var Q = src[1].split(" ").map(v => parseInt(v));
  var grid = new Array(M+2);
  for(var a=0;a<M+2;a++){
    var row=new Array(M+2).fill(0);
    grid[a]=row;
  }
  for(var a=Math.ceil(M/2-1);a>=0;a--){
    for(var b=1;b<M+1;b++){
      for(var c=1;c<M+1;c++){
        if(b==a+1||c==a+1||b==M-a||c==M-a){
          grid[b][c]=a;
        }
      }
    }
  }
  for(var a=1;a<M+1;a++){
    grid[a][0]=-2;
    grid[a][M+1]=-2;
  }
  grid[0].fill(-2);
  grid[M+1].fill(-2);
  var total=0;

  function openOut(y,x){
    grid[y][x]=-2;
    if(y>=2&&grid[y-1][x]>=0&&mark2[y-1][x]==0){
      mark2[y-1][x]=1;
      grid[y-1][x]=0;
    }
    if(y<=M-1&&grid[y-1][x]>=0&&mark2[y+1][x]==0){
      mark2[y+1][x]=1;
      grid[y+1][x]=0;
    }
    if(x>=2&&grid[y-1][x]>=0&&mark2[y][x-1]==0){
      mark2[y][x-1]=1;
      grid[y][x-1]=0;
    }
    if(x<=M-1&&grid[y-1][x]>=0&&mark2[y][x+1]==0){
      mark2[y][x+1]=1;
      grid[y][x+1]=0;
    }
    if(y>=2&&grid[y-1][x]==-2&&mark2[y-1][x]==0){
      mark2[y-1][x]=1;
      openOut(y-1,x);
    }
    if(y<=M-1&&grid[y+1][x]==-2&&mark2[y+1][x]==0){
      mark2[y+1][x]=1;
      openOut(y+1,x);
    }
    if(x>=2&&grid[y][x-1]==-2&&mark2[y][x-1]==0){
      mark2[y][x-1]=1;
      openOut(y,x-1);
    }
    if(x<=M-1&&grid[y][x+1]==-2&&mark2[y][x+1]==0){
      mark2[y][x+1]=1;
      openOut(y,x+1);
    }

  }
  function lower(y,x){
    var value=grid[y][x];
    if(y>2&&grid[y-1][x]>value&&mark[y-1][x]==0){
      mark[y-1][x]=1;
      lower(y-1,x);
      grid[y-1][x]--;
    }
    if(y<M&&grid[y+1][x]>value&&mark[y+1][x]==0){
      mark[y+1][x]=1;
      lower(y+1,x);
      grid[y+1][x]--;
    }
    if(x>2&&grid[y][x-1]>value&&mark[y][x-1]==0){
      mark[y][x-1]=1;
      lower(y,x-1);
      grid[y][x-1]--;
    }
    if(x<M&&grid[y][x+1]>value&&mark[y][x+1]==0){
      mark[y][x+1]=1;
      lower(y,x+1);
      grid[y][x+1]--;
    }
  }
  for(var a=0;a<Q.length;a++){
    var y = Math.ceil(Q[a]/M);
    var x = Q[a]%M;
    if(x==0){
      x=M;
    }
    total+=grid[y][x];
    var mark = new Array(M+2);
    for(var b=0;b<M+2;b++){
      var submark=new Array(M+2).fill(0);
      mark[b]=submark;
    }
    var mark2 = new Array(M+2);
    for(var b=0;b<M+2;b++){
      var submark=new Array(M+2).fill(0);
      mark2[b]=submark;
    }
    lower(y,x);
    grid[y][x]=-1;
    if(grid[y-1][x]==-2||grid[y+1][x]==-2||grid[y][x-1]==-2||grid[y][x+1]==-2){
      grid[y][x]=-2;
      if(y>=2&&grid[y-1][x]>=0){
        grid[y-1][x]=0;
      }
      if(y<=M-1&&grid[y+1][x]>=0){
        grid[y+1][x]=0;
      }
      if(x>=2&&grid[y][x-1]>=0){
        grid[y][x-1]=0;
      }
      if(x<=M-1&&grid[y][x+1]>=0){
        grid[y][x+1]=0;
      }
      if(y>=2&&grid[y-1][x]==-1){
        grid[y-1][x]=-2;
        openOut(y-1,x);
      }
      if(y<=M-1&&grid[y+1][x]==-1){
        grid[y+1][x]=-2;
        openOut(y+1,x);
      }
      if(x>=2&&grid[y][x-1]==-1){
        grid[y][x-1]=-2;
        openOut(y,x-1);
      }
      if(x<=M-1&&grid[y][x+1]==-1){
        grid[y][x+1]=-2;
        openOut(y,x+1);
      }

    }
  }

  console.log('%s', total);
  return total;
}

function dbg(id){
  var src = document.getElementById("input"+id).value;
  var total=Main(src);
  var verdict="WA";
  if(total==document.getElementById("output"+id).value.split("\n")[0]){
    verdict="AC";
  }
  document.getElementById("result"+id).innerHTML=verdict;
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
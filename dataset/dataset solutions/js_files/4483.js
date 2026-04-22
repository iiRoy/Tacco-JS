function Main(input) {
  input = input.split("\n");
  var n = parseInt(input[0]);
  d1 = new Array(n).fill(n);
  d1[0]=0;
  d2 = new Array(n).fill(n);
  d2[n-1]=0;
  side = new Array(n).fill([]);
  for(i=0;i<n-1;i++){
    if(side[parseInt(input[i+1].split(" ")[0])-1].length==0){
    side[parseInt(input[i+1].split(" ")[0])-1]=[parseInt(input[i+1].split(" ")[1])-1];
    }else{
    side[parseInt(input[i+1].split(" ")[0])-1].push(parseInt(input[i+1].split(" ")[1])-1);
    }
    if(side[parseInt(input[i+1].split(" ")[1])-1].length==0){
      side[parseInt(input[i+1].split(" ")[1])-1]=[parseInt(input[i+1].split(" ")[0])-1];
    }else{
    side[parseInt(input[i+1].split(" ")[1])-1].push(parseInt(input[i+1].split(" ")[0])-1);
    }
  }
  function f(x,d){
    queue = new Array(n);
    for(i=0;i<n;i++){
      queue[i]=i;
    }
    while(queue.length!=0){
      for(i=0;i<side[x].length;i++){
        if(d[side[x][i]]>d[x]){
          d[side[x][i]]=d[x]+1;
        }
      }
      queue.splice(queue.indexOf(x),1);
      var min=n;
      for(i=0;i<queue.length;i++){
        if(d[queue[i]]<min){
          x=queue[i];
          min=d[queue[i]];
        }
      }
    }
    return d;
  }
  d1=f(0,d1);
  d2=f(n-1,d2);
  var x=0;
  for(i=0;i<n;i++){
    if(i!=0&&i!=n-1){
      if(d1[i]<=d2[i]){
        x++;
      }
    }
  }
  var ans="Fennec";
  if(x<=n-2-x){
    ans="Snuke";
  }

  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
function kakeru (listx,listy){
  var count = 0;
  for (var k=0; k <listx.length; k++){
    count = count + listx[k]*listy[k]
  }
  return count
}

function tasu(listx,listy){
  for (var k=0; k < listx.length; k++){
    listx[k]=listx[k]+listy[k]
    listy[k]=listy[k]+listx[k]
  }
}


function Main (input){
    input=input.split(/\n/).map(n => n.split(' ').map(v => +v));
    const N = input[0][0];
    const M = input[0][1];
    // グラフの記録
    var G = []
    for (var i=0; i<N; i++) {
      G.push([])
      for (var j=0; j<N; j++){
        G[i].push(0)
      }
    }

    for (var i=0; i<N; i++){
      G[i][i]=1;
    }

    var a,b;
    for (var i=1; i<=M; i++){
      a = input[i][0];
      b = input[i][1];
      G[a-1][b-1]=1;
      G[b-1][a-1]=1;
    }
    // 上下に卸す。
    for (var i=0; i<N; i++){
      for (var I=0; I<N; I++){
        if (kakeru(G[i],G[I])!=0) tasu(G[i],G[I])
      }
    }

    var group = []
    var cities =[...Array(N).keys()]
    for (var i=0; i<N; i++){
      if(cities[i]!=null){
        cities[i]=null
        group.push([i])
        for (var j=0; j<N; j++){
          if(i!=j && G[i][j]!=0) {
            group[group.length-1].push(j)
            cities[j]=null;
          }
        }}
    }

    result = group.length-1
    console.log(result)
};


Main(require("fs").readFileSync("/dev/stdin", "utf8"));

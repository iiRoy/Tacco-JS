function permutation(n,k){
    var ret=[[]];
    var next;
    for(var i=0;i<k;i++){
        next=[];
        ret.forEach(e=>{
            for(var k=1;k<=n;k++){
                if(!e.includes(k)){
                    next.push(e.concat([k]));
                }
            }
        });
        ret=next.concat([]);
    }
    return ret;
}

function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const N=input[0].split(' ')[0]-0;
  const K=input[0].split(' ')[1]-0;
  const R=input[1].split(' ')[0]-0;
  const S=input[1].split(' ')[1]-0;
  const P=input[1].split(' ')[2]-0;
  const T=input[2];
  var ans=0;
  var passed=new Array(N);
  passed.fill(false);
  for(var i=0;i<T.length;i++){
    if(i>=K&&T[i]===T[i-K]&&!passed[i-K]){
      passed[i]=true;
      continue;
    }
    switch(T[i]){
      case 'r':
        ans+=P;
        break;
      case 's':
        ans+=R;
        break;
      case 'p':
        ans+=S;
        break;
    }
  }
  console.log(ans);
}


//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
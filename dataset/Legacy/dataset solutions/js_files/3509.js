function main(input) {
  var N = input[0].split(" ")[0]-0;
  var list = input[1].split(" ").map(v=>v-0);
  var a = {};
  var b = {};
  list.forEach((v,i)=>{
    if(i%2==0){
      a[v] = (a[v]||0)+1;
    }else{
      b[v] = (b[v]||0)+1;
    }
  });
  var alist = Object.keys(a).sort((aa,bb)=>a[bb]-a[aa]);
  var blist = Object.keys(b).sort((aa,bb)=>b[bb]-b[aa]);
  var ans = 0;
  var abase,bbase = 0;
  if(alist[0] == blist[0]){
    if(alist[1] > blist[1]){
      abase = 0, bbase = 1;
    }else {
      abase = 1, bbase = 0;
    }
  }else{
    abase = 0, bbase=0;
  }
  alist.filter((v,i)=>i!=abase).forEach(v=>ans+=a[v]);
  blist.filter((v,i)=>i!=bbase).forEach(v=>ans+=b[v]);
  console.log(ans);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"))

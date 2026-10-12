  ans=-1;
  l =require('fs').readFileSync('/dev/stdin','utf8').split("\n");
  k=~~l[0].split(" ")[1] 
  l.shift();
  l=l.map(n => Number(n)).sort((a,b)=> a-b);
  for(a=0;a<l.length-k+1;a++){
    dif=l[a+k-1]-l[a];
    if(ans===-1)ans = dif;
    if(dif < ans) ans = dif;
  }
  console.log(ans);
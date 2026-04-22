function main(input) {
  input=input.trim();
  const N = parseInt(input.split(" ")[0], 10);
  const M = parseInt(input.split(" ")[1], 10);

  var arrA=[]
  for(var i=0; i<M; i++){
    arrA.push(parseInt(input.split("\n")[i+1], 10))
  }

  //2段以上すきまがないかの判定用変数
  var mu=0;

  var dansa=[]
  dansa.push(arrA[0]-1)
  for(var i=1; i<M; i++){
    dansa.push(arrA[i]-arrA[i-1]-2)
  }
  dansa.push(N-arrA[M-1]-1)
  //console.log(dansa);

  for(var i=0; i<arrA.length; i++){
    if(arrA[i+1]-arrA[i]==1){
      mu++
    }
  }

  var nantori=[]
  for(var i=0; i<dansa.length; i++){
    var ans=0
    if(dansa[i]==1||dansa[i]==0){
      ans=1
    }else if(dansa[i]==2){
      ans=2
    }else{
      var tempArr=[1,2]
      for(var j=2; j<dansa[i]; j++){
        var temp=tempArr[j-1]+tempArr[j-2]
        tempArr.push(temp)
      }
      ans=tempArr[dansa[i]-1]
    }
    //console.log(ans);
    nantori.push(ans%1000000007)
  }
  //console.log(nantori);
  var ans=1
  for(var i=0; i<nantori.length; i++){
    ans=ans*nantori[i]%1000000007
  }

  //console.log(mu);
  if(mu!=0){
    console.log(0);
  }else{
    console.log(ans%1000000007);
  }
  
}



main(require('fs').readFileSync('/dev/stdin', 'utf8'));

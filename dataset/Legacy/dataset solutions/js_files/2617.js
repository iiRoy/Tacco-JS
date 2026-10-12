function main(input) {
  input=input.trim();
  const N = parseInt(input.split(" ")[0], 10);
  const K = parseInt(input.split(" ")[1], 10);

  var arrA=input.split('\n')[1].split(' ').map((n) => parseInt(n, 10));
  var arrIkou=[]
  var arrZentai=[]

  var ans=0

  for(var i=0; i<N; i++){
    var temp=0
    for(var j=i; j<N; j++){
      if(arrA[i]>arrA[j]){
        temp++
      }
    }
    arrIkou.push(temp)

    var temp2=0
    for(var j=0; j<N; j++){
      if(arrA[i]>arrA[j]){
        temp2++
      }
    }
    arrZentai.push(temp2)
  }
  //console.log(arrIkou);
  //console.log(arrZentai);
  for(var i=0; i<N; i++){
    var temp=(arrIkou[i]*K)%(1e9+7)+(arrZentai[i]*K*(K-1)*0.5)%(1e9+7)
    ans+=temp%(1e9+7)
    ans=ans%(1e9+7)
  }
  console.log(ans%(1e9+7));
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
function Main(input){
  var n=Number(input);
  var t=1;
  var count=0;
  for(var i=1;i<=n;i++)t*=i
  firsty=[];
  for(var i=1;i<=(t/2);i++){
    if(t%i==0){
      firsty.push(i)
    }
  }
  for(a in firsty){
    var count2=0;
    for(var f=0;f<=firsty[a]/2;f++)if((firsty[a]/2)%f==0)count2++;
    if(count2==75)count++;
  }
  console.log(count);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
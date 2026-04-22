function Main(input) {
  input = input.split("\n");
  var h = parseInt(input[0].split(" ")[0]);
  var w = parseInt(input[0].split(" ")[1]);
  var n = parseInt(input[1]);
  tmp = input[2].split(" ");
  a= new Array();
  for(i=0;i<n;i++){
    var x = parseInt(tmp[i]);
    for(j=0;j<x;j++){
      a.push(i+1);
    }
  }
  var ans="";
  anssub=new Array(h).fill("");
  for(i=0;i<h;i++){
    anssub[i]=a[i*w];
    for(j=1;j<w;j++){
      if(i%2==0){
        anssub[i]=anssub[i]+" "+a[i*w+j];
      }else{
        anssub[i]=a[i*w+j]+" "+anssub[i];
      }
      if(j==w-1){
        anssub[i]=anssub[i]+"\n";
      }
    }
    ans+=anssub[i];
  }
  ans=ans.slice(0,-1);
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
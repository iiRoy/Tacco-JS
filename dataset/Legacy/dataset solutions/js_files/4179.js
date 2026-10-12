function Main(input) {
  input = input.split("\n");
  var n = parseInt(input[0].split(" ")[0]);
  tmp=input[1].split(" ");
  a = new Array(n).fill(0);
  b = new Array();
  for(i=0;i<n;i++){
    a[i]=parseInt(tmp[i]);
    if(i>0&&a[i]<a[i-1]&&a[i]>0){
      bsub=[i-1,i];
      b.push(bsub);
      a[i]=a[i-1]+a[i];
    }else if(i>0&&a[i]<0&&a[i]<a[i-1]){
      bsub=[i-1,i];
      for(j=0;a[i]+a[i-1]*(j)<=a[i-1];i++){
        b.push(bsub);
        a[i]+=a[i-1];
      }
      b.push(bsub);
      a[i]+=a[i-1];
    }
  }
  var ans =b.length;
  for(i=0;i<b.length;i++){
    ans+="\n"+b[i][0]+" "+b[i][1];
  }
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
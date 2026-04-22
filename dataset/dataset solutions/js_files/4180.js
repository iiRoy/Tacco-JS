function Main(input) {
  input = input.split("\n");
  var n = parseInt(input[0].split(" ")[0]);
  tmp=input[1].split(" ");
  a = new Array(n).fill(0);
  b = new Array();
  var max=-Math.pow(10,6);
  var min=Math.pow(10,6);
  for(i=0;i<n;i++){
    a[i]=parseInt(tmp[i]);
    max=Math.max(a[i],max);
    min=Math.min(a[i],min);
  }
  if(min>=0){
    for(i=0;i<n;i++){
      if(i>0&&a[i]<a[i-1]){
        bsub=[i,i+1];
        b.push(bsub);
        a[i]=a[i-1]+a[i];
      }
    }
  }else if(max<0){
    for(i=n-1;i>=0;i--){
      if(i<n-1&&a[i]>a[i+1]){
        bsub=[i+1,i];
        b.push(bsub);
        a[i]=a[i+1]+a[i];
      }
    }
  }else if(max>Math.abs(min)){
    for(i=0;i<n;i++){
      if(a.indexOf(max)!=i){
        bsub=[a.indexOf(max),i];
        b.push(bsub);
        a[i]=a[i]+max;
      }
    }
    for(i=0;i<n;i++){
      if(i>0&&a[i]<a[i-1]){
        bsub=[i,i+1];
        b.push(bsub);
        a[i]=a[i-1]+a[i];
      }
    }
  }else if(Math.abs(min)>max){
    for(i=0;i<n;i++){
      if(a.indexOf(min)!=i){
        bsub=[a.indexOf(min),i];
        b.push(bsub);
        a[i]=a[i]+min;
      }
    }
    for(i=n-1;i>=0;i--){
      if(i<n-1&&a[i]>a[i+1]){
        bsub=[i+1,i];
        b.push(bsub);
        a[i]=a[i+1]+a[i];
      }
    }
  }
  var ans =b.length;
  for(i=0;i<b.length;i++){
    ans+="\n"+b[i][0]+" "+b[i][1];
  }
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
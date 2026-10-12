function Main(input) {
  input = input.split("\n");
  var h = parseInt(input[0].split(" ")[0]);
  var w = parseInt(input[0].split(" ")[1]);
  var n = parseInt(input[1]);
  tmp = input[2].split(" ");
  a=new Array(n).fill(0);
  for(i=0;i<n;i++){
    a[i]=parseInt(tmp[i]);
  }
  var ans ="";
  c = new Array(h).fill(0);
  for(i=0;i<h;i++){
    csub = new Array(w).fill(0);
    c[i]=csub;
  }
  d = new Array();
  for(i=0;i<n;i++){
    for(j=0;j<a[i];j++){
      d.push(i+1);
    }
  }
  for(i=0;i<h;i++){
    if(i%2!=1){
      for(j=0;j<w;j++){
        c[i][j]=d[i*w+j];
      }
    }else{
      for(j=0;j<w;j++){
        c[i][j]=d[(i+1)*w-j];
      }
    }
  }
  for(i=0;i<h;i++){
    if(i%2!=1){
      for(j=0;j<w;j++){
        if(j%w!=w-1){
        ans+=d[i*w+j]+" ";
        }else{
        ans+=d[i*w+j]+"\n";
        }
      }
    }else{
      for(j=0;j<w;j++){
        if(j%w!=w-1){
        ans+=d[(i+1)*w-j]+" ";
        }else{
          ans+=d[(i+1)*w-j]+"\n";
        }
      }
    }
  }
  ans=ans.substr(0,ans.length-1);
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
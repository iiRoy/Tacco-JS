function Main(input) {
  input = input.split("\n");
  var n = parseInt(input[0]);
  var ans="1";
  var x =0;
  var a =0;
  if(n>0){
    for(i=0;x<n;i=i+2){
      x+=Math.pow(2,i);
      a=i
    }
    for(i=0;i<a;i++){
      if(n>x-Math.pow(2,a-i)/2){
        if(i%2==0){
        ans+="0";
        x=x;
        }else{
          ans+="1";
          x=x;

        }
      }else{
        if(i%2==0){
        ans+="1";
        x=x-Math.pow(2,a-i)/2;
        }else{
          ans+="0";
          x=x-Math.pow(2,a-i)/2;

        }
      }
    }

  }else if(n<0){
    for(i=1;x>n;i=i+2){
      x+=Math.pow(-2,i);
      a=i
    }
    for(i=1;i<=a;i++){
      if(n>x+Math.pow(2,a-(i-1))/2){
        if(i%2==0){
        ans+="0";
        x=x;
        }else{
          ans+="1";
          x=x;

        }
      }else{
        if(i%2==0){
        ans+="1";
        x=x+Math.pow(2,a-(i-1))/2;
        }else{
          ans+="0";
          x=x+Math.pow(2,a-(i-1))/2;

        }
      }
    }

  }else{
    ans=0;
  }
  console.log('%s', ans);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
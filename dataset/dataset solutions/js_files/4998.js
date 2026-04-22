function zeroPadding(numStr,n){
  var zeros='';
  for(var k=0;k<n;k++){
    zeros = zeros+'0';
  }
  return (zeros + numStr).slice(-n);
}

function Inverse(arr){
  var N=arr.length;
  var M=Math.pow(2,N);
  var returnArray=[];
  for(var k=0;k<2501;k++){
    returnArray[k]=0;
  }
  for(var i=0;i<M;i++){
    var b=zeroPadding((i.toString(2)),N);
    var index=0;
    for(var j=0;j<N;j++){
      index += (b[j]==='1')?arr[j]:0;
    }
    returnArray[index]++;
  }
  return returnArray;
}

function main(input){
  var counter=0;
  var Lines=input.split('\n');
  Lines[0]=Lines[0].split(' ');
  Lines[1]=Lines[1].split(' ');
  var N=parseInt(Lines[0][0]);
  var A=parseInt(Lines[0][1]);
  var x=Lines[1];
  var xPlus,xMinus,xZero;
  for(var l=0;l<N;l++){
    x[l]=parseInt(x[l])-A;
  }
  
  xPlus=x.filter(function(num){return num>0;});
  xMinus=x.filter(function(num){return num<0;});
  xZero=x.length-xPlus.length-xMinus.length;
  var zeroChoice=Math.pow(2,xZero);
  
  for(var hoge=0;hoge<xMinus.length;hoge++){
    xMinus[hoge]=-xMinus[hoge];
  }
  
  A=Inverse(xPlus);
  B=Inverse(xMinus);
 
  for(var o=1;o<2501;o++){
      counter += A[o]*B[o];
  }
  console.log((counter+1)*(zeroChoice+1)-1);
}

main(require('fs').readFileSync('/dev/stdin', 'UTF-8'));

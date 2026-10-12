
function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const Q=input[0].split(' ')[0];
  var sum=0;
  var a=[];
  var insert,min,max,mid;
  var temp;
  for(var i=1;i<input.length;i++){
    if(input[i]==='2'){
      console.log(a[Math.ceil(a.length/2)-1],sum);
    }else{
      temp=input[i].split(' ').slice(1).map(e=>{
        return e-0;
      });
      if(a.length===0){
        a=[temp[0]];
        sum+=temp[1];
        continue;
      }
      if(a[a.length-1]<temp[0]){
        insert=a.length;
      }else if(a[0]>=temp[0]){
        insert=0;
      }else{
        max=a.length-1;
        min=0;
        while(max-min>1){
          mid=Math.floor((max+min)/2);
          if(a[mid]<temp[0]){
            min=mid;
          }else{
            max=mid;
          }
        }
        insert=min+1;
      }
      if(a.length%2===0){
        if(insert>a.length/2){
          sum+=temp[0]-a[a.length/2];
        }else if(insert<a.length/2){
          sum+=a[a.length/2-1]-temp[0];
        }
      }else{
        sum+=Math.abs(temp[0]-a[(a.length-1)/2]);
      }
      a.splice(insert,0,temp[0]);
      sum+=temp[1];
    }
  }
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
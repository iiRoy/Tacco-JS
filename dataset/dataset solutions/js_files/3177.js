"use strict"
function Main(input){
  input=input.split(/\s+/);
  for(let i=0;i<input.length;i++)
    input[i]=parseInt(input[i],10);
  var A=input.shift();
  var B=input.shift();
  var Q=input.shift();
  var s=input.splice(0,A);
  var t=input.splice(0,B);
  var x=input;
  var y=binarySort(x);
  var s_before=[];
  var s_after=[];
  var t_before=[];
  var t_after=[];
  var p=0,q=0;
  for(let i=0;i<Q;i++){
    while(s[p]<y[i][0])
      p++;
    s_before[i]=(s[p-1]||-1e14);
    s_after[i]=(s[p]||1e14);
    while(t[q]<y[i][0])
      q++;
    t_before[i]=(t[q-1]||-1e15);
    t_after[i]=(t[q]||1e15);
  }
//  console.log(s_before,s_after);
  var ans=[];
  for(let i=0;i<Q;i++){
    let j=y[i][1];
    let Y=y[i][0];
    let sb=s_before[i],sa=s_after[i],tb=t_before[i],ta=t_after[i]; 
/*    if(sb<=tb&&ta<=sa){
      ans[j]=Math.min(sa-Y,Y-sb);
    }else if(tb<=sb&&sa<=ta){
      ans[j]=Math.min(ta-Y,Y-tb);
    }else if(tb<=sb&&ta<=sa){
      ans[j]=Math.min(sa-Y,Y-tb,2*ta-Y-sb,Y+ta-2*sb);
    }else if(sb<=tb&&sa<=ta){
      ans[j]=Math.min(ta-Y,Y-sb,2*sa-Y-tb,Y+sa-2*tb);
    }*/
    let abs=Math.abs;
    ans[j]=Math.min(
      abs(sa-Y)+abs(ta-sa),
      abs(sa-Y)+abs(tb-sa),
      abs(sb-Y)+abs(ta-sb),
      abs(sb-Y)+abs(tb-sb),
      abs(ta-Y)+abs(sa-ta),
      abs(ta-Y)+abs(sb-ta),
      abs(tb-Y)+abs(sa-tb),
      abs(tb-Y)+abs(sb-tb)
    ).toString(10);
  }
  console.log(ans.join("\n").trim()+'\n');
}

function binarySort(A){ 
  var a=A.length;
  var B=[[A[0],0]];
  for(let i=1;i<a;i++){
    let u=B.length-1;
    let d=0;
    let m=Math.floor((d+u)/2);
    while(!(d>u)){
      if(B[m][0]<A[i]){
        d=m+1;
      }else{
        u=m-1;
      }
      m=Math.floor((d+u)/2);
    }
    B.splice(m+1,0,[A[i],i]);
  }
  return B;
}

Main(require('fs').readFileSync("/dev/stdin","utf8"));

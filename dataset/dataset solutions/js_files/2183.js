const factorial=(num=>num<=1?1:num*factorial(num-1));

//パターン取得
const getPattern=((n,k,keta,i,xnum,pflag)=>{
  if(i>=keta){return 1;}
  let num1=0;
  let num2=0;
  let num=0;

  //上位がぴったり
  if(pflag){
    //対象が0じゃない
    if(n[i]!==0){
      //0が存在する
      if(n-i!=k-xnum){
        //xが存在する
        if(k-xnum>0){
          //先頭が0になるパターン
          const pNum=factorial(keta-i-1)/(factorial(k-xnum)*factorial(keta-i-1-k+xnum));

          //総数
          num1=(k-xnum)*9*pNum;
        }
        else{
          num1=1;
        }
      }

      //xが存在する
      if(k-xnum>0){
        if(n[i]>1){
          //ぴったりじゃない
          num2=(n[i]-1)*getPattern(n,k,keta,i+1,xnum+1,false);
        }
        //ぴったり
        num2=getPattern(n,k,keta,i+1,xnum+1,true);
      }

      num=num1+num2;
    }

    //対象が0
    else{
      num=getPattern(n,k,keta,i+1,xnum,true);
    }
  }
  //上位がぴったりじゃ無い
  else{
    const pNum=factorial(keta-i)/(factorial(k-xnum)*factorial(keta-i-k+xnum));
    num=(k-xnum)*9*pNum;
  }

  return num;
});

function Main(input){
  var inputs=input.split("\n");
  const n=inputs[0];
  const k=inputs[1];
  const keta=inputs[0].length;
  
  const num=getPattern(n,k,keta,0,0,true);

  console.log(num);
}
Main(require('fs').readFileSync('/dev/stdin','utf8'));

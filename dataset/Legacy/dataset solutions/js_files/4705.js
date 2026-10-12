function Main(input) {
  input=input.split("\n");
  var S=input[1];
  var array;
  var flg=false;
  ["S","W"].forEach(a=>{
    ["S","W"].forEach(b=>{
      array=new Array(S.length);
      array[0]=a;
      array[1]=b;
      for(var i=2;i<S.length;i++){
        if(array[i-1]==="W"^S[i-1]==="o"){
          array[i]=array[i-2];
        }else{
          if(array[i-2]==="W"){
            array[i]="S";
          }else{
            array[i]="W";
          }
        }
      }
      //console.log(array.join(""));
      //console.log(array[0]==="S");
      //console.log(S[0]==="o");
      //console.log(array[array.length-1]===array[1]);
      //console.log(array[0]==="S"^S[0]==="o"^array[array.length-1]===array[1]);
      //console.log(array[array.length-1]==="S"^S[array.length-1]==="o"^array[array.length-2]===array[0]);
      if(!flg&&(array[0]==="S"^S[0]==="o"^array[array.length-1]===array[1])&&(array[array.length-1]==="S"^S[array.length-1]==="o"^array[array.length-2]===array[0])){
         console.log(array.join(""));
         flg=true;
      }
    });
  });
  if(!flg)console.log(-1);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

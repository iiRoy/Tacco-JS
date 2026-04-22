function Main(input) {
  input=input.split("\n");
  var array=input[1].split(" ");
  var memo=[];
  var counter=0;
  array.forEach(e=>{
    if(memo.includes(e)){
      counter++;
    }else{
      memo.push(e);
    }
  });
  console.log(input[0]-Math.ceil(counter/2)*2);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

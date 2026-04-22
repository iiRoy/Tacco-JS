function Main(input) {
  input=input.split("\n");
　const N=input[0]-0;
　var temp;
  var t,a;
 　var n;
  t=input[1].split(" ")[0]-0;
  a=input[1].split(" ")[1]-0;
  for(var i=2;i<input.length;i++){
    temp=input[i].split(" ");
    [0,1].forEach(e=>{
      temp[e]-=0;
    });
    var counter=1;
    n=Math.ceil(Math.max(t/temp[0],a/temp[1]));
    t=temp[0]*n;
    a=temp[1]*n;
  }
  console.log(a+t);
}

//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
  
  

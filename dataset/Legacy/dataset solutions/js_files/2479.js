function factorization(num){
    var dividor=2;
    var workbench=num;
    var ret=[];
    while(workbench>1){
        if(workbench%dividor===0){
            workbench/=dividor;
            ret.push(dividor);
        }else{
            dividor++;
        }
        if(dividor**2>workbench){
            ret.push(workbench);
            break;
        }
    }
    return ret;
}

function Main(input) {
  input=input.split("\n");
  if(input[input.length-1]===''){
    input.pop();
  }
  const a=input[0].split(' ')[0]-0;
  const b=input[0].split(' ')[1]-0;
  const x=input[0].split(' ')[2]-0;
  console.log(180/Math.PI*Math.atan(a*b*b/x/2));


}




//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
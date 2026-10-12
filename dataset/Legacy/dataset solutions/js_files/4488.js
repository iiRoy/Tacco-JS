function Main(input){
    input = input.split("\n");
    var mem = input[0].split(" ").map(Number);
    var arr = input[1].split(" ").map(Number);
    {for(var i=0;i<arr.length;i++){
        arr[i] %= 2;
    }}
    var ans = [BigInt(1),BigInt(0)];
    for(var i=0;i<arr.length;i++){
        if(arr[i]==0){
            ans[0]*=2n;
            ans[1]*=2n;
        }else{
            var tmp = ans[0]+ans[1];
            ans[0] = tmp;
            ans[1] = tmp;
        }
        console.log(ans)
    }
    console.log(ans[mem[1]].toString())
}Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
function Main(input){
    input=input.split("\n");  //ここまで必須
    var line=input[0].split(" ");
    var result="";
    for (i=0;i<5;i++){
        if (line[i]==0){result=i}
    }
    console.log(parseInt(result)+1)
}
Main(require("fs").readFileSync("/dev/stdin","utf8"));
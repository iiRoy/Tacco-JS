function Main(input) {
  input = input.split("\n");
  var A = parseInt(input[0].split(" ")[0]);
  var B = parseInt(input[0].split(" ")[1]);
  grid=new Array(100);
  for(i=0;i<100;i++){
    if(i<50){
    tmp=new Array(100).fill(".");
    }else{
      tmp= new Array(100).fill("#");
    }
    grid[i]=tmp;
  }
  for(i=0;i<B-1;i++){
    grid[Math.round(i/50)*2][(i%50)*2]="#";
  }
  for(i=0;i<A-1;i++){
    grid[99-Math.round(i/50)*2][(i%50)*2]=".";
  }
  gridrow=new Array(100);
  for(i=0;i<100;i++){
    gridrow[i]=grid[i].join("");
  }
  var ans=gridrow.join("\n");


  console.log('%s', ans);
}
  
// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function debug(){
  var input = document.getElementById("input").value;
  Main(input);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
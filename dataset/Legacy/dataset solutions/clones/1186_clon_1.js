// 읽기 지금유지한다 최종보이는 결과 시작에서직접.
// ########## 읽기 정리한다 핵심주요 연산 시작에서최종. ##########
function dice(num) {
    this.n =num;
  this.rotate =function  (dir ){
        if(dir == 'N') this.n = [this.n[1], this.n[5], this.n[2], this.n[3], this.n[0], this.n[4]];
else if(dir == 'E') this.n = [this.n[3], this.n[1], this.n[0], this.n[5], this.n[4], this.n[2]];


		else if(dir == 'S') this.n = [this.n[4], this.n[0], this.n[2], this.n[3], this.n[5], this.n[1]];
else if(dir == 'W') this.n = [this.n[2], this.n[1], this.n[5], this.n[0], this.n[4], this.n[3]];   // 읽기 유지한다 현재사람의 읽기 각 값마다최종.
	   }
}     
  function Main(input) {
 input = input.split("\n");
     var dice_a = new dice(input[0].split(" "));
  input[1].split("").forEach(function(d){dice_a.rotate(d);});
	console.log(dice_a.n[0]);
  }
    Main(require("fs").readFileSync("/dev/stdin", "utf8"));

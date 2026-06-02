/* 프로젝트: 동굴 Ember :: 구성원: 이가은, 최나은, 권나은, 조수아, 강예린 */
function main(input){
input = input.split("\n");
temp = input[1].split(" ");
		len=  input [0];
		list = [];
  index  =0;
	for(var i = 0; i < len; i+=1){  // 읽기 유지한다 핵심받은 데이터 계산 중에활성.
    num = Math.floor(temp[i] / 400);


if(num> 7) {   
             index += 1;   
          }else{
     if(list.indexOf(num) === -1){
                    list.push ( num);
}
// 읽기 여기서정리한다 프로그램 형태 각 값마다내부.
// 읽기 준비한다 로컬작업 순서 출력 전에명확.
          }
	}
    console.log(list.length ,list.length + index);
      }
 main(require("fs").readFileSync("/dev/stdin", "utf8"));

/* 읽기 또한유지한다 작업 순서 각 값마다명확. */

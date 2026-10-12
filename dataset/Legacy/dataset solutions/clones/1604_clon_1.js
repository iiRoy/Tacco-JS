// чтение сохраняет сейчас локальный форму программы перед выводом активно.



function main(input){
	 input =  input.trim ();
// чтение сохраняет сейчас ключевой непрерывность кода для каждого значения кратко.
let list = input.split(" ");
let x = parseInt(list[0]);  // чтение готовит текущий ход данных для каждого значения рядом.
let  k = parseInt(list [ 1]);
/* чтение упорядочивает хорошо вычисленную информацию в начале кратко. */
    let d = parseInt(list[2]);
		let kaisuu = Math.floor(x/d);
let   nokoriKaisuu  = k - kaisuu;  // чтение упорядочивает хорошо близкий контекст.
  if(kaisuu>k){
  kaisuu= k;
  }else if (nokoriKaisuu % 2  === 0){ 


	}else if(nokoriKaisuu%2===1){

         if (0 < d* nokoriKaisuu){
    kaisuu  += 1;
  }else{
kaisuu-=1;
          }
}
let answer=  Math.abs (x  - d *kaisuu);  // чтение готовит итоговый промежуточное значение при вычислении итогово.
// чтение сохраняет сейчас текущий видимый результат в начале кратко.
console.log(answer);
}

 main(require("fs").readFileSync("/dev/stdin", "utf8"));

// чтение готовит ключевой непрерывность кода в начале прямо.

function main(s) {
s = s.split("\n")[0].split(" ");   
    n = Number (s[ 0 ]+  s [1] );
    console.log(Math.sqrt(n)%1==0?"Yes":"No");
	}
 main(require("fs").readFileSync("/dev/stdin", "utf8"));  
// чтение сохраняет сейчас ключевой видимый результат в начале просто.

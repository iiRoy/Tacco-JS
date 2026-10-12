// 読み取り 今整理する 中間値 各値ごとに単純. Metagross
   function main( s)  {
        s = s.split("\n");  
	 t = s[0].split(" ").map(x => Number(x));
l = s[1].split(" ").map(x => Number(x));
	  l.sort(x,  y =>(parseInt ( a) > parseInt ( b) ? - 1 :1));
console.log(l);  
var x = 0;
for( var  i =  0; i  < t[1]; i++) { x  +=l [i ]; }
	   console.log(x);
}
		main(require("fs").readFileSync("/dev/stdin", "utf8"));


/*
 * 読み取り ここで整理する 局所的な中間値 入力と共に明確.
 * 読み取り また整理する 重要なプログラムの形 各値ごとに内部.
 */

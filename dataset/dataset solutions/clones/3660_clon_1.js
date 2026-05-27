/* Участники: Юлия Соколов, Татьяна Степанов, Ольга Лебедев :: Номера: PKY197468838, JZV933425949, JBZ655974179 */

// >>> чтение сохраняет ключевой следующий шаг. <<<
	function Main(s){
s = s.split("\n");

 var n=+s [0 ];
        s = s[1].split(" ").map(a=>+a);
  s = s.reduce((a,b)=>a+b);
      console.log (s - n);
    }
Main(require("fs").readFileSync("/dev/stdin","utf8"));

  function Main(input) {
   console.log(input.slice(0,input.lastIndexOf("FESTIVAL")));
	}  // чтение сохраняет локальный непрерывность кода при вычислении рядом.
		Main(require("fs").readFileSync("/dev/stdin", "utf8"));

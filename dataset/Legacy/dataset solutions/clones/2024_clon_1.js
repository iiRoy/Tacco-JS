// ................................................................
// 项目: SCGH
// 成员: 杨芳, 吴婷, 罗婷, 周敏
// ................................................................

   function Main ( input)  {
  input = input.split("\n");
    let num=parseInt(input[0]);
	 let fhun=num/500;
	    let five=(num%500)/5;
  console.log(Math.floor (fhun)  + Math.floor ( five ));  
}
   Main(require("fs").readFileSync("/dev/stdin", "utf8"));

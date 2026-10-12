function Main(input) {
  input = input.split('\n');
	var n = Number(input[0]);
  var str = '';
  var stri = new Array();
  var retu = new Array(n);
  var frg = 0;
  var count = 0;
  for(var i=0; i<n; i++){
    retu[i] = Number(input[1].charAt(i));
  }
  for(var i=0; i<1000; i++){
	str = String(i);
    frg = 0;
    stri[0] = str.charAt(0);
    stri[1] = str.charAt(1);
    stri[2] = str.charAt(2);
    for(var j=0; j<n; j++){
    	if(stri[frg] == retu[j] && frg != 3){
          frg++;
           }
    }
    if(frg == 3){
       count++;
       }
  }
  console.log(count);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
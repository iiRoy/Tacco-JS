function Main(input) {
	var str = input;
	str = str.split("\n");
	var t =[];
	var ans = 0;
	var n= Number((str[0].split(" ")[0]));
	for (var i = 1;i<str.length;i++){
		t[i-1] = str[i].split(" ");
		t[i-1] = t[i-1].map(Number);
		}
// 		console.log(t);
	var tlen = t.length;
	var cost =Array(tlen);
	for (var k = 0;k<tlen; k++){
		target = t[k];
		var nk = target[0];
		var ak = target[1];
		var bk = target[2];
		var ck = target[3];
		var dk = target[4];
		cost[k] = mod(nk,ak,bk,ck,dk);
		console.log(cost[k]);
	}
}
		function mod(n,a,b,c,d){
			var mod2 =0;
			var mod3 =0;
			var mod5 =0;
			var n2 = 0;
			var n3 = 0;
			var n5 = 0;	
			while(n%2===0){
					n2 = n/2;
					mod2++;
					mod(n2,a,b,c,d);		
			}while(n%3===0){
					n3 = n/3;
					mod3++;	
					mod(n3,a,b,c,d);							
			}while(n%5===0){
					n5 = n/5;
					mod5++;
					mod(n5,a,b,c,d);								
			}
			if(mod2===0&&mod3===0&&mod5===0){//われなかった
				return Math.min(mod(n+1,a,b,c,d),mod(n-1,a,b,c,d));
			}
		}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

function Main(input) {
	let array = input.split('\n');
	const h = array[0].split(' ')[0]*1
	const w = array[0].split(' ')[1]*1
	array = array.filter((elm,i)=>i>=1);

	const empty_num = input.match(/(\.)/g);

	if(!empty_num){
		//爆弾しかない
		console.log(array.join('\n')+'\n');
		
	}else if(empty_num.length==w*h){
		//爆弾がない
		console.log(array.join('\n').replace(/./g,'0')+'\n');

	}else{
		for(var i=0;i<lines.length;i++){
			for(var j=0;j<lines[i].length;j++){
				if(lines[i][j]!='.') continue;
				u = !lines[i-1]? null : lines[i-1][j], //上
				d = !lines[i+1]? null : lines[i+1][j], //下
				r = j==w ? null : lines[i][j+1], //右
				l = j==0 ? null : lines[i][j-1], //左
				ur = !(u && r) ? null : lines[i-1][j+1], //右上
				ul = !(u && l) ? null : lines[i-1][j-1], //左上
				dr = !(d && r) ? null : lines[i+1][j+1], //右下
				dl = !(d && l) ? null : lines[i+1][j-1]; //左下
				var num = (u+r+d+l+ur+ul+dr+dl).match(/#/g);
				num = !num ? 0 : num.length;
				lines[i] = lines[i].replace('.', num);
			};
		}
		console.log(lines.join('\n'));
	}
}
//Main(require("fs").readFileSync("/dev/stdin", "utf8"));
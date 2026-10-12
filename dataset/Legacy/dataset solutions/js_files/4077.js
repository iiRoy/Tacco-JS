// 色の算出
function Judge(x,y,c,k,tx,ty) {
	var col = c;
	if( Math.floor((tx-x)/k) % 2 != 0 )
	{
		col ^= 1;
	}
	if( Math.floor((ty-y)/k) % 2 != 0 )
	{
		col ^= 1;
	}
	return col;
}


// inputに入力データ全体が入る
function Main(input) {
	// 1行目がinput[0], 2行目がinput[1], …に入る
	input = input.split("\n");
	var tmp = input[0].split(" ");
	var cnt = tmp[0]-0;
	var k = tmp[1]-0;
	var x = [];
	var y = [];
	var c = [];
	//文字列から10進数に変換するときはparseIntを使います
	var ret = 0;
	for (i=0; i<cnt; i++)
	{
		tmp = input[i+1].split(" ");
		x.push(tmp[0]-0);
		y.push(tmp[1]-0);
		c.push(tmp[2]=="B"?0:1);
	}

	for (i=0; i<cnt; i++)
	{
		for (a=0; a<k; a++)
		{
			for (b=0; b<k; b++)
			{
				var sum = 0;
				for (j=0; j<cnt; j++)
				{
					sum += (Judge( x[i]-a, y[i]-b, c[0], k, x[j], y[j] )==c[j])?1:0;
				}
				if( ret < sum )
				{
					ret = sum;
				}
			}
		}
	}

	//出力
	console.log('%d',ret);
}
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

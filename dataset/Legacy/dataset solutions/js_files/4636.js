'use strict'

/////////////////////////////////////
//コピペスペース//////////////////////

//定数
const INF  =  900719925474099 // Math.floor(Number.MAX_SAFE_INTEGER / 10);

//スペース区切りの数字列を数字の配列にして返す
function mapint(line){return line.split(' ').map((v)=>parseInt(v));}

function lower_bound(d,a,b,e){
    for(var c;1<b-a;)
        d[c=0|(a+b)/2]<e ? a=c : b=c;
    return d[a]<e?b:a
};

const MOD = 1000000007;
//コピペスペース//////////////////////
/////////////////////////////////////

function Main(input){
	let temp = input.trim().split('\n');
	let temp2 = mapint(temp[0]);
	let n = temp2[0];
	let l = temp2[1];
	let t = temp2[2]%l;

	let f = mapint(temp[1]);
	let ans = new Array(n);
	let num = 0;
	let aa;
	for(let i=1;i<=n;i++){
		temp2 = mapint(temp[i]);
		//すれ違い計算
		aa=t+1;
		if(f[1]===2 && temp2[1]===1){
			if(f[0]<temp2[0]){
				aa = (l+f[0]-temp2[0])/2;
			}else{
				aa = (f[0] - temp2[0])/2
			}
			if(aa<=t){
				num+=n;
				if(aa+l/2<=t) num -= 2;
				else num -= 1;
				num%=n;
			}
			//console.log('2,1:',aa,t,num);
		}
		if(f[1]===1 && temp2[1]===2){
			if(f[0]>temp2[0]){
				aa = (l-f[0]+temp2[0])/2;
			}else{
				aa = (temp2[0] - f[0])/2
			}
			if(aa<=t){
				if(aa+l/2<=t) num += 2;
				else num += 1;
				num%=n;
			}
			//console.log('1,2:',aa,t,num);
		}
		
		//最終的な場所計算
		if(temp2[1]===1) ans[i-1] = (temp2[0] + t)%l;
		else			 ans[i-1] = (temp2[0] - t + l)%l;
	}
	let fa = ans[0];
	ans.sort((a,b)=>a-b);
	let low = lower_bound(ans,0,ans.length,fa);
	//console.log(ans,fa,num,low);
	//場所特定
	let ans2 = new Array(n);
	for(let i=0;i<n;i++){
		ans2[num] = ans[low];
		low++;  num++;
		low%=n; num%=n;
	}
	console.log(ans2.join('\n'));

}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

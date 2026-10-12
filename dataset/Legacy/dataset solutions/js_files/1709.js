var toInt = x=>parseInt(x,10);
var toIntArr = arr=>arr.map(x=>toInt(x));
var abs = x=>x>0?x:-x;
function min(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]<val)val = rest[i];return val}
function max(){var rest = arguments,val=rest[0];for(var i=1;i<rest.length;i++)if(rest[i]>val)val = rest[i];return val}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
 
function Main(input){
	var input = input.split('\n');
	input = input.map(e => toIntArr(e.split(' ')));
	var d = input[0][0];
	var cs = input[1];
	var ss = input.slice(2);
	//var ts = input.slice(d+2).map(e=>e[0]);
	
	var score = 0;
	var ans = [];
	let type;
	var lastday = [];
	lastday.length = 26;
	lastday.fill(-1);

	//let scoreDay = [];

	//day(0~25)にtype(1~26)を選んだ場合の満足度の変化(lastdayのdayは0~)
	function getScore(day,type,lastday){
		let ans = 0;
		ans += ss[day][type-1];
		for(let t = 0; t < 26; t++){
			if(t!==type-1) ans -= cs[t] * (day - lastday[t]);
		}
		return ans;
	}

	let d3 = Math.floor(d/3);
	let rest = d - d3*3;

	var tempScore; // [[t0,t1,t2,score],...]
	var tempLastday;
	let subScore;

	for(let i = 0; i < d3; i++){
		tempScore = [];

		for(let t0 = 0; t0 < 26; t0++){
			tempLastday = lastday.concat();
			subScore = 0;

			tempLastday[t0] = i*3;
			subScore += getScore(i*3,t0+1,tempLastday);
			for(let t1 = 0; t1 < 26; t1++){
				tempLastday[t1] = i*3 +1;
				subScore += getScore(i*3+1,t1+1,tempLastday);
				for(let t2 = 0; t2 < 26; t2++){
					tempLastday[t2] = i*3 +2;
					subScore += getScore(i*3+2,t2+1,tempLastday);
					tempScore.push([t0,t1,t2,subScore]);
					}
				}
			}

		//console.log(tempScore)
		let want = tempScore.map(e=>e[3]).indexOf(Math.max(...tempScore.map(e=>e[3])));
		let want2 = tempScore[want];
		//console.log(want,want2)
		ans.push(want2[0]+1,want2[1]+1,want2[2]+1);
		lastday[want2[0]] = i*3;
		lastday[want2[1]] = i*3+1;
		lastday[want2[2]] = i*3+2;

	}

	for(let i = d3*3; i < d; i++){
		tempScore = [];

		for(let j = 0; j < 26; j++){
			tempScore[j] = getScore(i,j+1,lastday);
		}

		let want = tempScore.indexOf(Math.max(...tempScore));
		ans.push(want+1);
		lastday[want] = i;

	}

	console.log(ans.join('\n'));
}

//a.indexOf(Math.max(...a))
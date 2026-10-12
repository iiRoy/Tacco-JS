function main(input) {

	var answer = 0;
	var input1 = input.split('\n');
	var num_people = input1[0].split(' ')[0];
	var num_candy = input1[0].split(' ')[1];
	var num_demands = input1[1].split(' ');

	//少ない順に並び替え、お菓子の総量を超えるまでで足し続ける。

	//昇順に並び替え
	num_demands.sort(function(a, b) {
	  return a - b;
	});

	var sum_candy = 0;
	for (var i = 0; i < num_people; i++) {
	  	answer = i;
	  	sum_candy += num_demands[i];

	  	//需要が供給を上回ったとき
	  	if(sum_candy > num_candy){
			console.log(answer);
			break;
		}
		 	
	}

	//answer +=1;
	console.log(answer);

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
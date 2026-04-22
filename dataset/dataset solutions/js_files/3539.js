function main(input) {

	var answer = 0;
	var num_people = input.split('\n')[0].split(' ')[0];
	var num_candy = input.split('\n')[0].split(' ')[1];
	var num_demands = input.split('\n')[1].split(' ');

	//少ない順に並び替え、お菓子の総量を超えるまでで足し続ける。

	//昇順に並び替え
	num_demands.sort(function(a, b) {
	  return a - b;
	});

	var sum_candy = 0;
	for (var i = 0; i < num_people; i++) {
	  	answer = i;
	  	sum_candy += parseInt(num_demands[i]);
	  	
	  	//需要が供給を上回ったとき
	  	if(sum_candy > num_candy){
			console.log(parseInt(answer));
			return;
		}
		 	
	}

	answer +=1;
	console.log(answer);

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
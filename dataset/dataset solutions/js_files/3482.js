function gcd(a, b) {
    if (b === 0){
        return a
	}
    return gcd(b, a % b)
}

function get_indexs(n,l){
	var array = []
	array.push(0)

	for (var i = 1; i <= n - 1; i++) {
		array.push((i*l)/n)
	}

	return array
}


function main(arg) {
	var arg = arg.split("\n")
	var tmp = arg[0].split(" ")
	var n = Number(tmp[0])
	var m = Number(tmp[1])
	var s = arg[1]
	var t = arg[2]


	var k = gcd(n,m)

	var ans = -1

	if (s === t) {
		console.log(n)
		return
	}

	if (n%m === 0 || m%n === 0) {
		console.log(-1)
	} else {
		var i = 0

		for (i = n*m/k; i < Math.pow(10,5); i+=(n*m/k)) {
			var n_arr = get_indexs(n, i)
			var m_arr = get_indexs(m, i)
			var flg = true


			for (var j = 0; j < i; j++) {
				var n_i = n_arr.indexOf(j)
				var m_i = m_arr.indexOf(j)

				if (n_i < 0 || m_i < 0) {
					continue
				}

				if (s[n_i] !== t[m_i]) {
					flg = false
					break
				}
			}


			if (flg) {
				break
			}

		}
		console.log(i)
	}

}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));


'use strict'
const main = arg => {
	const input = arg.trim().split("\n");
	let W = input[0].split(' ').map(num => Number(num))[0]
	let H = input[0].split(' ').map(num => Number(num))[1]
	let N = input[0].split(' ').map(num => Number(num))[2]
	let Xs = input.slice(1, input.length).map(el => Number(el.split(' ')[0]))
	let Ys = input.slice(1, input.length).map(el => Number(el.split(' ')[1]))
	let As = input.slice(1, input.length).map(el => Number(el.split(' ')[2]))
	let corners = [{x: 0, y: 0}, {x: 0, y: H}, {x: W, y: H}, {x: W, y: 0}]
 
	for(let i = 0 ; i < As.length ; i++) {
		let a = As[i]
		switch (a) {
			case 1:
				corners[0].x = Xs[i] > corners[0].x ? Xs[i] : corners[0].x
				corners[1].x = Xs[i] > corners[1].x ? Xs[i] : corners[1].x
				break
			case 2:
				corners[2].x = Xs[i] < corners[2].x ? Xs[i] : corners[2].x
				corners[3].x = Xs[i] < corners[3].x ? Xs[i] : corners[3].x
				break
			case 3:
				corners[0].y = Ys[i] > corners[0].y ? Ys[i] : corners[0].y
				corners[3].y = Ys[i] > corners[3].y ? Ys[i] : corners[3].y
				break
			case 4:
				corners[1].y = Ys[i] < corners[1].y ? Ys[i] : corners[1].y
				corners[2].y = Ys[i] < corners[2].y ? Ys[i] : corners[2].y
				break
		}
	}
	const width = corners[0].x - corners[2].x
	const heigth = corners[0].y - corners[1].y
	const square = heigth * width
	if(width < 0 || heigth < 0) {
		console.log(0)
		return
	}
	console.log(square >= 0 ? square : 0)
}   
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
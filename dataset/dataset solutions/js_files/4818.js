'use strict'

const main = input => {
	const c = input.trim()
	if (['a', 'e', 'i', 'o', 'u'].includes(c)) console.log('vowel')
	else console.log('consonant')
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'))

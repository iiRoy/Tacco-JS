'use strict'

const main = function (input) {
const strData = input.split(`\n`);
console.log(strData)
const split = strData[0].split(` `).map(v => parseInt(v));
const numOfFriends = split[0];
const regulatedHeight = split[1];
const friendsHeightData = strData[1].split(` `).map(v => parseInt(v));
const allowedNumOfFriends = friendsHeightData.filter(v => v >= regulatedHeight).length;
console.log(allowedNumOfFriends);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));  
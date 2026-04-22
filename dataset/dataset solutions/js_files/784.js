/**
 * Created by hiroqn on 13/10/14.
 */
var fs = require('fs'),
    length = fs.fstatSync(process.stdin.fd).size,
    buffer = new Buffer(length),
    bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0),
    input = buffer.toString('utf8', 0, bytesRead).split('\n');
main();
function main() {
  var sum,
      coins,
      fa = [10, 50, 100, 500],
      ck,
      amount,
      t,
      i, j;
  while (input[0] !== '0') {
    sum = +input.shift();
    coins = input.shift().split(' ').map(Number);
    amount = 0;
    for (i = 0; i < 4; i++) {
      amount += coins[i] * fa[i];
    }
    amount -= sum;
    for (i = 3; i >= 0; i--) {
      t = ~~(amount / fa[i]);
//      console.log(coins, t, amount);
      t = coins[i] < t ? coins[i] : t;
      coins[i] = coins[i] - t;
      amount %= fa[i];
    }

    for (i = 0; i < 4; i++) {
      if (coins[i] > 0) {
        console.log(fa[i] + ' ' + coins[i]);
      }
    }
    console.log('');
  }
}
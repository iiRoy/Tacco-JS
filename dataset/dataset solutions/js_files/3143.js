function main(input) {
    const args = input.split('\n');
    var one = args[0].split(' ');

    var N = parseInt(one[0], 10);
    var M = parseInt(one[1], 10);
    var purchase_count = 0;
    var purchase_money = 0;

    var shop_info = {
        Money: '',
        Max_count: ''
    };

    var shops_info = [];

        for (var i = 0; i < N; i++) {
        Drinks = args[i + 1].split(' ');
        shops_info[i] = { Money: parseInt(Drinks[0], 10), Max_count: parseInt(Drinks[1], 10)}
    }

    shops_info.sort((a, b) => { return (a.Money < b.Money) ? -1 : 1;})

    var target_shop;

    for (var i = 0; i < N; i++) {
        target_shop = shops_info[i]
        if(target_shop.Max_count + purchase_count <= M) {
            purchase_money += target_shop.Max_count * target_shop.Money;
            purchase_count += target_shop.Max_count;
            if (purchase_count === M) {
                break;
            }
        } else {
            // for(var j = 0; j < target_shop.Max_count; j++) {
            //     purchase_money += target_shop.Money;
            //     purchase_count += 1;
            //     if(purchase_count === M) {
            //         break;
            //     }
            target_count = M - purchase_count;
            purchase_money += target_shop.Money * target_count;
            break;
            }
        }

    console.log(purchase_money);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8'));

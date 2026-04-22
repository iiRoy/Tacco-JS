/*
 * This JavaScript function calculates the minimum cost to purchase a specific
 * quantity of items from various shops.
 *
 * It takes a single string `input` as its argument, which represents the
 * input data.
 *
 * The input string is expected to be multi-line:
 * - The first line contains two space-separated integers: N (number of shops)
 *   and M (total items to purchase).
 * - Subsequent N lines each contain two space-separated integers:
 *   the cost per item for that shop and the maximum number of items available
 *   in that shop.
 *
 * The function then prints the total minimum purchase money to the console.
 */
function main(
    input
)
{
    // Split the input string into an array of lines.
    const args = input.split(
        '\n'
    );

    // Parse the first line to get N and M.
    var one = args[0]
        .split(
            ' '
        );

    // N: Number of available shops.
    var N = parseInt(
        one[0],
        10
    );
    // M: Total number of items to purchase.
    var M = parseInt(
        one[1],
        10
    );

    // Initialize variables to track the purchase progress.
    var purchase_count = 0; // Current total items purchased.
    var purchase_money = 0; // Current total money spent.

    // A temporary object structure for shop information (not directly used for storage).
    var shop_info = {
        Money: '',    // Cost per item.
        Max_count: '' // Maximum items available.
    };

    // Array to store information about all shops.
    var shops_info = [];

    // Loop through each shop's information from the input.
    for (
        var i = 0;
        i < N;
        i++
    )
    {
        // Extract shop details from the current line.
        // Note: 'Drinks' is a variable name used in the original problem context,
        // it refers to the items being sold.
        Drinks = args[i + 1]
            .split(
                ' '
            );

        // Store shop information as an object in the 'shops_info' array.
        shops_info[i] = {
            Money: parseInt(
                Drinks[0],
                10
            ),
            Max_count: parseInt(
                Drinks[1],
                10
            )
        };
    }

    // Sort the shops by their item price in ascending order.
    // This strategy ensures we always buy from the cheapest available shop first.
    shops_info.sort(
        (a, b) => {
            return (
                a.Money < b.Money
            )
                ? -1
                : 1;
        }
    );

    // Variable to hold the current shop being considered.
    var target_shop;

    // Iterate through the sorted shops to make purchases.
    for (
        var i = 0;
        i < N;
        i++
    )
    {
        // Get the current shop's details.
        target_shop = shops_info[i];

        // Check if buying all items from the current shop would exceed the
        // total desired purchase quantity (M).
        if (
            target_shop.Max_count + purchase_count <= M
        )
        {
            // If we can buy all items from this shop without exceeding M,
            // then do so as it's the cheapest available.
            purchase_money += target_shop.Max_count * target_shop.Money;
            purchase_count += target_shop.Max_count;

            // If we've reached the target quantity M, we can stop buying.
            if (
                purchase_count === M
            )
            {
                break;
            }
        }
        else
        {
            /*
             * Original commented-out code for buying one by one:
             *
             * for(var j = 0; j < target_shop.Max_count; j++) {
             *     purchase_money += target_shop.Money;
             *     purchase_count += 1;
             *     if(purchase_count === M) {
             *         break;
             *     }
             * }
             *
             * The optimized approach below directly calculates the remaining items needed.
             */

            // If buying all items from this shop would exceed M,
            // calculate how many more items are needed to reach M.
            target_count = M - purchase_count;

            // Purchase only the remaining 'target_count' items from this shop.
            purchase_money += target_shop.Money * target_count;

            // Since we've now purchased exactly M items, we can break the loop.
            break;
        }
    }

    // Output the total calculated purchase money.
    console.log(
        purchase_money
    );
}

// Read input from stdin and call the main function.
main(
    require('fs')
        .readFileSync(
            '/dev/stdin',
            'utf8'
        )
);
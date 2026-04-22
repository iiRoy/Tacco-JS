export default{

    /*
     * This module provides functionality to parse and stringify
     * various types of 'Kopi' (coffee) orders based on their names.
     * It handles different ingredients, states, and sweetness levels.
     */
    parse ( name ) {

        // Normalize the input name: trim whitespace and convert to lowercase.
        name = name.trim().toLowerCase();

        /*
         * Initialize default ingredient quantities and state.
         * These values will be adjusted based on the parsed name.
         */
        var coffee         = 0;
        var condensed_milk = 0; /* Sweetened milk component */
        var evaporated_milk= 0; /* Unsweetened milk component */
        var sugar          = 0;
        var water          = 0;
        var state          = 'warm';


        // Check if the name starts with 'kopi' indicating a coffee-based drink.
        if ( / ^kopi / .test ( name ) ) {

            // SECTION 1: Determine the base type of Kopi and its primary ingredients.
            // By default, Kopi has sugar. This will be overridden if 'kosong' is present.
            sugar = 1;

            // Handle 'Kopi C' (with evaporated milk).
            if ( / ^kopi\s(c|si|see)\b / .test ( name ) ) {

                evaporated_milk = .2;
                water           = .4;
                coffee          = .4;

            }
            // Handle 'Kopi O' (black coffee).
            else if ( / ^kopi\soh?\b / .test ( name ) ) {

                water  = .5;
                coffee = .5;

            }
            // Default 'Kopi' (with condensed milk).
            else {

                condensed_milk  = .2;
                water           = .4;
                coffee          = .4;

            }

            // SECTION 2: Determine the state (temperature) of the drink.

            // 'Peng' or 'Bing' indicates iced coffee.
            if ( / \b(peng|bing)\b / .test ( name ) ) {

                state = 'iced';

            }
            // 'Pua Sio' indicates lukewarm coffee.
            else if ( / \bpua sio\b / .test ( name ) ) {

                state = 'lukewarm';

            }

            // SECTION 3: Apply various expressions that modify ingredients or sweetness.

            /*
             * 'Kosong' means "no sugar".
             * This check also includes a validation for condensed milk,
             * as condensed milk inherently contains sugar.
             */
            if ( / \bkosong\b / .test ( name ) ) {

                if ( condensed_milk ) {

                    // It's an invalid combination to have condensed milk and no sugar.
                    throw new Error ( 'Invalid Kopi. Condensed milk contains sugar.' );

                }

                sugar = 0; // Set sugar to zero.

            }
            /*
             * 'Gah Dai' (or 'Kah Tai') means "extra sweet".
             * Adjusts milk, water, and coffee ratios if milk is present,
             * and sets sugar to a higher value.
             */
            else if ( / \b(ga|ka)h?\s(d|t)ai\b / .test ( name ) ) {

                if ( condensed_milk > 0 ) {

                    condensed_milk += .1;
                    water          -= .05;
                    coffee         -= .05;

                } else if ( evaporated_milk > 0 ) {

                    evaporated_milk += .1;
                    water           -= .05;
                    coffee          -= .05;

                }

                sugar = 1.5; // Set sugar to an extra sweet level.

            }
            /*
             * 'Siu Dai' (or 'Siew Tai') means "less sweet".
             * Reduces the sugar level.
             */
            else if ( / \b(siu|siew|xiu)\s(t|d)ai\b / .test ( name ) ) {

                sugar = .5; // Set sugar to a less sweet level.

            }
            /*
             * 'Po' means "more water, less coffee".
             * Adjusts water and coffee quantities.
             */
            else if ( / \bpoh?\b / .test ( name ) ) {

                water  += .1;
                coffee -= .1;

            }
            /*
             * 'Gau' (or 'Kao') means "more coffee, less water" (stronger).
             * Adjusts water and coffee quantities.
             */
            else if ( / \b(g|k)a(u|o)\b / .test ( name ) ) {

                water  -= .1;
                coffee += .1;

            }
            /*
             * 'Di Lo' means "no water, more coffee" (very strong).
             * Transfers all water quantity to coffee and sets water to zero.
             */
            else if ( / \bdi\slo\b / .test ( name ) ) {

                coffee += water;
                water   = 0;

            }

        }
        // Handle the special case of plain 'water'.
        else if ( / ^water$ / .test ( name ) ) {

            water = 1;

        }

        // Return the final object containing all parsed ingredient quantities and state.
        return {
            water,
            coffee,
            sugar,
            condensed_milk,
            evaporated_milk,
            state
        };

    }, /* End of parse method */


    /*
     * Converts an object of Kopi ingredients into a human-readable string.
     * @param {object} ingredients - An object containing ingredient quantities and state.
     * @returns {string} A string representation of the Kopi order.
     */
    stringify ( ingredients = { } ) {

        // Destructure the ingredients object for easier access.
        var { condensed_milk, evaporated_milk, state, sugar, coffee, water } = ingredients;

        // Initialize variables to store text components of the Kopi order.
        var coffeeText    = '';
        var stateText     = '';
        var milkText      = '';
        var sweetnessText = '';

        // Determine the milk type component (C for evaporated, O for no milk/black).
        if ( evaporated_milk > 0 ) {

            milkText = ' C'; // Kopi C (with evaporated milk)

        } else if ( condensed_milk <= 0 ) { // If no condensed milk, assume black 'Kopi O'.

            milkText = ' O'; // Kopi O (black coffee)

        }

        // Determine the state (temperature) component.
        if ( state == 'iced' ) {

            stateText = ' Peng'; // Iced coffee

        } else if ( state == 'lukewarm' ) {

            stateText = ' Pua Sio'; // Lukewarm coffee

        }

        // Determine the coffee strength component.
        if ( coffee > water ) {

            if ( water == 0 ) {

                coffeeText = ' Di Lo'; // Very strong, no water

            } else if ( condensed_milk > water ) {
                // This condition seems a bit off from the parse logic,
                // but we must preserve the original expression.
                sweetnessText = ' Gah Dai'; // This might be a mistake in the original logic.

            } else {

                coffeeText = ' Gao'; // Stronger coffee

            }

        } else if ( coffee < water ) {

            coffeeText = ' Po'; // Weaker coffee, more water

        }

        // Determine the sweetness component.
        if ( sugar == 0 && condensed_milk <= 0 ) {

            sweetnessText = ' Kosong'; // No sugar

        } else if ( sugar < 1 ) {

            sweetnessText = ' Siew Dai'; // Less sweet

        } else if ( sugar > 1 ) {

            sweetnessText = ' Gah Dai'; // Extra sweet

        }

        // Construct the final string using template literals.
        return `Kopi${ milkText }${ stateText }${ coffeeText }${ sweetnessText }`;

    } /* End of stringify method */

}; /* End of export default object */
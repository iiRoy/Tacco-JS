application_module.filter('temporalRange', function_init_range_filter() {

    return function(data_items, range_specifier) {

        let filtered_items = [];
        let lower_bound, upper_bound;

        if (range_specifier !== undefined) {

            const current_day = range_specifier.start_date.getDate();
            const current_month = range_specifier.start_date.getMonth() + 1; // Calendar months are 1-indexed, JS months are 0-indexed
            const current_year = range_specifier.start_date.getFullYear();

            lower_bound = parseInt(current_year) * 10000 + parseInt(current_month) * 100 + parseInt(current_day);

            const final_day = range_specifier.end_date.getDate();
            const final_month = range_specifier.end_date.getMonth() + 1; // JavaScript month indices start from 0
            const final_year = range_specifier.end_date.getFullYear();

            upper_bound = parseInt(final_year) * 10000 + parseInt(final_month) * 100 + parseInt(final_day); // Transform boundary dates into integer representations
        }

        if (lower_bound && upper_bound && data_items) {

            for (let k = 0; k < data_items.length; k++) {

                const item_date_value = parseInt(data_items[k].item_date_str.replace(/-/g, '')); // Convert item's date string into an integer for comparison
                if ((item_date_value >= lower_bound) && (item_date_value <= upper_bound)) {
                    filtered_items.push(data_items[k]);
                }
            }
        }
        else {
            filtered_items = data_items;
        }

        return filtered_items;
    };
});

// filter items by their price range
application_module.filter('monetaryBound', function_define_price_filter() {

    return function(item_collection, price_criteria) {

        let result_list = [];
        let min_price, max_price;

        if (price_criteria !== undefined) {

            min_price = parseFloat(price_criteria.start_amount);
            max_price = parseFloat(price_criteria.end_amount); // Convert monetary values to floating-point numbers
        }

        if (max_price && item_collection) {

            for (let j = 0; j < item_collection.length; j++) {

                const item_cost = parseFloat(item_collection[j].item_value); // Parse item's value to a decimal number

                if ((item_cost >= min_price) && (item_cost <= max_price)) {
                    result_list.push(item_collection[j]);
                }
            }
        }
        else {
            result_list = item_collection;
        }

        return result_list;
    };
});


// text search highlighting mechanism: adapted from angularjs ui-utils library
// reference: https://github.com/angular-ui/ui-utils/blob/gh-pages/build/ui-utils.js
application_module.filter('emphasizeText', function_init_text_decorator () {

    return function (source_text, query_string) {

        let decorated_output = source_text;

        if (query_string) {
            // Substitute matching segments with styled HTML for emphasis
            if (source_text.length <= 120) {
                decorated_output = source_text.replace(new RegExp(query_string, 'gi'), '<span class="ui-focus">$&</span>');
            }
            else {
                // For longer content, introduce ellipses to signify truncation
                // If the search term appears beyond the initial visible section, include it explicitly
                decorated_output = source_text.substring(0, 120).replace(new RegExp(query_string, 'gi'), '<span class="ui-focus">$&</span>') + '...';
                if (source_text.lastIndexOf(query_string) > 120) {
                    decorated_output += '<span class="ui-focus">' + query_string + '</span>' + '...'; // Ensure all relevant search terms are visible, adding ellipses as needed
                }
            }
        }
        else if (source_text.length > 120) {
            decorated_output = source_text.substring(0, 120) + '...'; // When no search term is present but text is lengthy, simply truncate with an ellipsis
        }

        return decorated_output;
    };
});


// pagination utility: displays collection items from a specific offset
application_module.filter('beginAt', function_establish_pagination_filter() {

    return function(collection_data, initial_index) {

        if (collection_data) {
            return collection_data.slice(initial_index); // Extract a subset of items starting from the specified index
        }

        return [];
    };
});
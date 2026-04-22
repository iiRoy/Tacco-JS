const global_cache_registry = new WeakMap();

const array_identity_check = (arr_one, arr_two) => {
    if (arr_one.length !== arr_two.length) {
        return false;
    }
    for (let current_index = 0; current_index < arr_one.length; current_index++) {
        if (arr_one[current_index] !== arr_two[current_index]) {
            return false;
        }
    }
    return true;
};

function memoization_proxy(...input_arguments) {
    const original_callable = this;

    if (!global_cache_registry.has(original_callable)) {
        global_cache_registry.set(original_callable, []);
    }

    const callable_specific_storage = global_cache_registry.get(original_callable);

    for (let cached_entry of callable_specific_storage) {
        const [stored_arguments, stored_result] = cached_entry;
        if (array_identity_check(stored_arguments, input_arguments)) {
            return stored_result;
        }
    }

    const calculated_outcome = original_callable.apply(original_callable, input_arguments);

    callable_specific_storage.push([input_arguments, calculated_outcome]);

    return calculated_outcome;
}

Object.defineProperty(Function.prototype, "cache_results", {
    value: memoization_proxy,
    writable: true,
    configurable: true
});
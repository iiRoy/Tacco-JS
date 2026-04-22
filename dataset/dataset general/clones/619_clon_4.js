const test_outcome_list = [];
let current_test_group_name = '';
let current_before_phase_routine = null;
let current_after_phase_routine = null;

function test_group(group_label, group_function) {
    const previous_group_name = current_test_group_name;
    const previous_before_routine = current_before_phase_routine;
    const previous_after_routine = current_after_phase_routine;

    current_test_group_name = group_label;
    current_before_phase_routine = null;
    current_after_phase_routine = null;

    try {
        group_function();
    } catch (e) {
        test_outcome_list.push({
            group: group_label,
            case: "Group Setup Failure",
            passed: false,
            error: e.message
        });
    } finally {
        current_test_group_name = previous_group_name;
        current_before_phase_routine = previous_before_routine;
        current_after_phase_routine = previous_after_routine;
    }
}

function test_case(case_label, case_function) {
    try {
        if (current_before_phase_routine) current_before_phase_routine();
        case_function();
        test_outcome_list.push({
            group: current_test_group_name,
            case: case_label,
            passed: true
        });
    } catch (e) {
        test_outcome_list.push({
            group: current_test_group_name,
            case: case_label,
            passed: false,
            error: e.message,
            stack: e.stack
        });
    } finally {
        if (current_after_phase_routine) current_after_phase_routine();
    }
}

function before_each_test(routine_function) {
    current_before_phase_routine = routine_function;
}

function after_each_test(routine_function) {
    current_after_phase_routine = routine_function;
}

function verify_equality(actual_val, expected_val, message = "Values are not identical") {
    if (actual_val !== expected_val) {
        throw new Error(`${message}\n  Expected: ${expected_val}\n  Actual:   ${actual_val}`);
    }
}

function summarize_results() {
    console.log("\n--- Verification Report ---");
    let successful_tests = 0;
    let failed_tests = 0;

    test_outcome_list.forEach(res => {
        if (res.passed) {
            successful_tests++;
            console.log(`✅ ${res.group} - ${res.case}`);
        } else {
            failed_tests++;
            console.error(`❌ ${res.group} - ${res.case}`);
            console.error(`   Failure: ${res.error}`);
        }
    });

    console.log(`\nOutcome: Total ${test_outcome_list.length}, Success ${successful_tests}, Failure ${failed_tests}`);
    if (failed_tests > 0) {
        // In a CI/CD context, this might trigger a process exit with an error code.
    }
}

// --- Simplified Reactive System (replacing Knockout) ---
const active_computation_stack = [];

function create_reactive_datum(initial_state) {
    let internal_state = initial_state;
    const dependency_subscribers = new Set();

    const data_accessor = function(new_state) {
        if (arguments.length > 0) {
            if (internal_state !== new_state) {
                internal_state = new_state;
                dependency_subscribers.forEach(sub => sub());
            }
        } else {
            if (active_computation_stack.length > 0) {
                dependency_subscribers.add(active_computation_stack[active_computation_stack.length - 1]);
            }
            return internal_state;
        }
    };
    data_accessor.dependency_subscribers = dependency_subscribers;
    return data_accessor;
}

function create_derived_datum(evaluation_logic) {
    let cached_result;
    const derived_subscribers = new Set();

    const re_calculate = () => {
        const prev_computation_stack_length = active_computation_stack.length;
        active_computation_stack.push(re_calculate); // Add self to context
        
        // Temporarily clear old dependencies
        // (This simplified approach doesn't manage dependency subscriptions dynamically for derived values)
        // For these specific tests, re-evaluation on demand is sufficient.

        const new_result = evaluation_logic();
        if (cached_result !== new_result) {
            cached_result = new_result;
            derived_subscribers.forEach(sub => sub()); // Notify own subscribers if value changed
        }
        active_computation_stack.length = prev_computation_stack_length; // Restore context
    };

    const derived_accessor = function() {
        if (active_computation_stack.length > 0) {
            derived_subscribers.add(active_computation_stack[active_computation_stack.length - 1]);
        }
        re_calculate(); // Always re-calculate when accessed to get fresh value (simple, not memoized)
        return cached_result;
    };
    derived_accessor.dependency_subscribers = derived_subscribers; // Expose for other reactive entities
    
    re_calculate(); // Initial calculation to set initial value

    return derived_accessor;
}

function create_reactive_collection(initial_items) {
    const collection_holder = create_reactive_datum(Array.isArray(initial_items) ? initial_items : []);

    const collection_accessor = function(new_items) {
        if (arguments.length > 0) {
            if (Array.isArray(new_items)) {
                collection_holder(new_items);
            }
            return this;
        } else {
            return collection_holder();
        }
    };

    // Mimic array methods to trigger reactivity
    ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'].forEach(method_name => {
        collection_accessor[method_name] = function(...args) {
            const current_array = collection_holder();
            const result = Array.prototype[method_name].apply(current_array, args);
            collection_holder(current_array); // Notify that the array content has changed
            return result;
        };
    });

    collection_accessor.dependency_subscribers = collection_holder.dependency_subscribers;

    return collection_accessor;
}

// --- DOM Utilities (replacing jQuery) ---
function select_element(selector) {
    return document.querySelector(selector);
}

function parse_html_string(html_segment) {
    const temporary_wrapper = document.createElement('div');
    temporary_wrapper.innerHTML = html_segment.trim();
    return Array.from(temporary_wrapper.childNodes);
}

function fetch_template_segment(id_key) {
    let template_source = document.getElementById(id_key);
    if (!template_source) {
        throw new Error(`Template source with ID '${id_key}' not found.`);
    }

    if (template_source.tagName === 'TEMPLATE') {
        return template_source.content.cloneNode(true); // Returns DocumentFragment
    } else if (template_source.tagName === 'SCRIPT' && template_source.type === 'text/ko-template') {
        const temp_frag = document.createDocumentFragment();
        parse_html_string(template_source.textContent).forEach(node => temp_frag.appendChild(node));
        return temp_frag;
    } else { // Assume it's a div or similar acting as a template
        const temp_frag = document.createDocumentFragment();
        parse_html_string(template_source.innerHTML).forEach(node => temp_frag.appendChild(node));
        return temp_frag;
    }
}

// --- Frame Animation Mock ---
let current_animation_scheduler = (task_fn) => task_fn();

function configure_sync_animation() {
    let original_scheduler = (task_fn) => setTimeout(task_fn, 0); // Default async
    before_each_test(function() {
        original_scheduler = current_animation_scheduler; // Save current mock
        current_animation_scheduler = (task_fn) => task_fn(); // Set to synchronous
    });
    after_each_test(function() {
        current_animation_scheduler = original_scheduler; // Restore original
    });
}

// --- Data Binding Logic (Cloned fastForEach) ---

// Applies text binding to elements within a node recursively
function apply_element_text_bindings_recursively(root_node, data_item_value) {
    if (root_node.nodeType === Node.ELEMENT_NODE) {
        const binding_attr = root_node.getAttribute('data-bind');
        if (binding_attr && binding_attr.includes('text: $data')) {
            root_node.textContent = data_item_value;
        }
        Array.from(root_node.children).forEach(child => apply_element_text_bindings_recursively(child, data_item_value));
    }
}

// Handles virtual text bindings (e.g., <!-- ko text: $data -->) within a parent node
function process_virtual_text_bindings_in_parent(parent_node, data_item_value) {
    let current_child = parent_node.firstChild;
    while (current_child) {
        const next_child = current_child.nextSibling; // Capture next sibling before potential modifications

        if (current_child.nodeType === Node.COMMENT_NODE) {
            const comment_content = current_child.nodeValue.trim();
            if (comment_content.startsWith('ko text: $data')) {
                let opener_comment = current_child;
                let closer_comment = null;
                let temp_current_sibling = opener_comment.nextSibling;
                let nodes_to_clean = [];

                while (temp_current_sibling && !(temp_current_sibling.nodeType === Node.COMMENT_NODE && temp_current_sibling.nodeValue.trim() === '/ko')) {
                    nodes_to_clean.push(temp_current_sibling);
                    temp_current_sibling = temp_current_sibling.nextSibling;
                }
                if (temp_current_sibling && temp_current_sibling.nodeValue.trim() === '/ko') {
                    closer_comment = temp_current_sibling;
                }

                if (opener_comment && closer_comment) {
                    nodes_to_clean.forEach(n => n.parentNode.removeChild(n));
                    const new_text_node = document.createTextNode(data_item_value);
                    opener_comment.parentNode.insertBefore(new_text_node, closer_comment);
                    // The `current_child` should now effectively skip to `closer_comment.nextSibling`
                    // The `next_child` (captured earlier) handles this.
                }
            }
        } else if (current_child.nodeType === Node.ELEMENT_NODE) {
            process_virtual_text_bindings_in_parent(current_child, data_item_value); // Recurse for children
        }
        current_child = next_child; // Move to the next node in the original sequence
    }
}

function initialize_list_display(container_element, data_source_configuration) {
    let data_retrieval_function;
    let reactive_entity_source;
    let template_payload_fragment = null;
    let named_template_key = null;

    if (typeof data_source_configuration === 'object' && data_source_configuration !== null && 'data' in data_source_configuration) {
        reactive_entity_source = data_source_configuration.data;
        named_template_key = data_source_configuration.name;
    } else {
        reactive_entity_source = data_source_configuration;
    }

    data_retrieval_function = () => {
        let current_source_value = typeof reactive_entity_source === 'function' ? reactive_entity_source() : reactive_entity_source;
        if (typeof current_source_value === 'function' && Array.isArray(current_source_value())) {
            current_source_value = current_source_value();
        }
        return Array.isArray(current_source_value) ? current_source_value : [];
    };

    if (named_template_key) {
        template_payload_fragment = fetch_template_segment(named_template_key);
    } else {
        template_payload_fragment = document.createDocumentFragment();
        let binding_start_comment = null;
        let binding_end_comment = null;

        Array.from(container_element.childNodes).forEach(node => {
            if (node.nodeType === Node.COMMENT_NODE) {
                if (node.nodeValue.trim().startsWith('ko fastForEach:')) {
                    binding_start_comment = node;
                } else if (node.nodeValue.trim() === '/ko') {
                    binding_end_comment = node;
                }
            }
        });

        if (binding_start_comment && binding_end_comment) {
            let current = binding_start_comment.nextSibling;
            while (current && current !== binding_end_comment) {
                template_payload_fragment.appendChild(current.cloneNode(true));
                current = current.nextSibling;
            }
            current = binding_start_comment.nextSibling;
            while (current && current !== binding_end_comment) {
                let next = current.nextSibling;
                container_element.removeChild(current);
                current = next;
            }
        } else {
            Array.from(container_element.childNodes).forEach(node => {
                if (node.nodeType !== Node.COMMENT_NODE) {
                    template_payload_fragment.appendChild(node.cloneNode(true));
                }
            });
            Array.from(container_element.childNodes).forEach(node => {
                if (node.nodeType !== Node.COMMENT_NODE) {
                    container_element.removeChild(node);
                }
            });
        }
    }

    let insertion_anchor = null;
    Array.from(container_element.childNodes).forEach(node => {
        if (node.nodeType === Node.COMMENT_NODE && node.nodeValue.trim() === '/ko') {
            insertion_anchor = node;
        }
    });

    let currently_rendered_item_nodes = new Map();

    const produce_item_dom_nodes = (item_value) => {
        const temp_processing_div = document.createElement('div');
        Array.from(template_payload_fragment.childNodes).forEach(node => temp_processing_div.appendChild(node.cloneNode(true)));

        Array.from(temp_processing_div.childNodes).forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                apply_element_text_bindings_recursively(node, item_value);
            }
        });
        process_virtual_text_bindings_in_parent(temp_processing_div, item_value);
        return Array.from(temp_processing_div.childNodes);
    };

    const refresh_display_elements = () => {
        const new_data_items = data_retrieval_function();

        for (const nodes_group of currently_rendered_item_nodes.values()) {
            nodes_group.forEach(node => {
                if (node.parentNode) node.parentNode.removeChild(node);
            });
        }
        currently_rendered_item_nodes.clear();

        const fragment_for_insertion = document.createDocumentFragment();
        new_data_items.forEach(item_value => {
            const item_nodes = produce_item_dom_nodes(item_value);
            currently_rendered_item_nodes.set(item_value, item_nodes);
            item_nodes.forEach(node => fragment_for_insertion.appendChild(node));
        });

        container_element.insertBefore(fragment_for_insertion, insertion_anchor);
    };

    current_animation_scheduler(refresh_display_elements);

    if (typeof reactive_entity_source === 'function' && reactive_entity_source.dependency_subscribers) {
        reactive_entity_source.dependency_subscribers.add(() => {
            current_animation_scheduler(refresh_display_elements);
        });
    }
}


// --- Test Definitions ---

test_group("displaying lists", function () {
    configure_sync_animation();

    test_case("handles a fixed item collection", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li data-bind='text: $data'></li>";

        var item_collection = [1, 2, 3];
        initialize_list_display(host_target, item_collection);
        verify_equality(host_target.querySelectorAll("li").length, 3);
    });

    test_case("handles a reactive item collection", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li data-bind='text: $data'></li>";

        var item_collection_reactive = create_reactive_collection([1, 2, 3]);
        initialize_list_display(host_target, item_collection_reactive);
        verify_equality(host_target.querySelectorAll("li").length, 3);
    });

    test_case("handles a simple reactive value with an array", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li data-bind='text: $data'></li>";

        var item_collection = [1, 2, 3];
        var simple_reactive_val = create_reactive_datum(item_collection);
        initialize_list_display(host_target, simple_reactive_val);
        verify_equality(host_target.querySelectorAll("li").length, 3);
    });

    test_case("handles a derived reactive value", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li data-bind='text: $data'></li>";

        var item_collection = [1, 2, 3];
        var derived_reactive_val = create_derived_datum(function () { return item_collection; });
        initialize_list_display(host_target, derived_reactive_val);
        verify_equality(host_target.querySelectorAll("li").length, 3);
    });

    test_case("applies data to immediate child elements", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li data-bind='text: $data'></li>";

        var item_collection = ['a', 'b', 'c'];
        initialize_list_display(host_target, item_collection);
        verify_equality(host_target.querySelector("li:nth-child(1)").textContent, "a");
        verify_equality(host_target.querySelector("li:nth-child(2)").textContent, "b");
        verify_equality(host_target.querySelector("li:nth-child(3)").textContent, "c");
    });

    test_case("applies to nested child elements", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li><em data-bind='text: $data'></em></li>";

        var item_collection = ['a', 'b', 'c'];
        initialize_list_display(host_target, item_collection);
        verify_equality(host_target.innerHTML, '<li><em data-bind="text: $data">a</em></li><li><em data-bind="text: $data">b</em></li><li><em data-bind="text: $data">c</em></li>');
    });

    test_case("handles virtual elements", function () {
        var host_target = document.createElement('div');
        host_target.innerHTML = "<!-- ko fastForEach: $data --><em data-bind='text: $data'></em><!-- /ko -->";
        var item_collection = ['A', 'B'];
        initialize_list_display(host_target, item_collection);
        verify_equality(host_target.innerHTML, '<!-- ko fastForEach: $data --><em data-bind="text: $data">A</em><em data-bind="text: $data">B</em><!-- /ko -->');
    });

    test_case("only binds inner (virtual) element", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<!-- ko text: $data -->Z<!-- /ko -->";
        var item_collection = ['E', 'V'];
        initialize_list_display(host_target, item_collection);
        verify_equality(host_target.innerHTML, '<!-- ko text: $data -->E<!-- /ko --><!-- ko text: $data -->V<!-- /ko -->');
    });

    test_case("binds mixed inner virtual elements", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "Q<!-- ko text: $data -->Z2<!-- /ko -->R";
        var item_collection = ['E2', 'V2'];
        initialize_list_display(host_target, item_collection);
        verify_equality(host_target.innerHTML, 'Q<!-- ko text: $data -->E2<!-- /ko -->RQ<!-- ko text: $data -->V2<!-- /ko -->R');
    });

    test_case("uses named template from <template> tag", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "Initial Content"; // This will be cleared

        var template_element = document.createElement('template');
        template_element.id = 'tID_clone';
        template_element.innerHTML = "X<!-- ko text: $data--><!--/ko-->";
        document.body.appendChild(template_element);

        var item_collection = ['F1', 'F2'];
        initialize_list_display(host_target, { name: "tID_clone", data: item_collection });
        verify_equality(host_target.innerHTML, "X<!-- ko text: $data-->F1<!--/ko-->X<!-- ko text: $data-->F2<!--/ko-->");
        template_element.remove();
    });

    test_case("uses named template from <script> tag", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "Initial Content";

        var script_element = document.createElement('script');
        script_element.type = 'text/ko-template';
        script_element.id = 'tID_script_clone';
        script_element.textContent = "Y<!-- ko text: $data--><!--/ko-->";
        document.body.appendChild(script_element);

        var item_collection = ['G1', 'G2'];
        initialize_list_display(host_target, { name: "tID_script_clone", data: item_collection });
        verify_equality(host_target.innerHTML, "Y<!-- ko text: $data-->G1<!--/ko-->Y<!-- ko text: $data-->G2<!--/ko-->");
        script_element.remove();
    });

    test_case("uses named template from <div> tag", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "Initial Content";

        var div_element = document.createElement('div');
        div_element.id = 'tID_div_clone';
        div_element.innerHTML = "Z<!-- ko text: $data--><!--/ko-->";
        document.body.appendChild(div_element);

        var item_collection = ['H1', 'H2'];
        initialize_list_display(host_target, { name: "tID_div_clone", data: item_collection });
        verify_equality(host_target.innerHTML, "Z<!-- ko text: $data-->H1<!--/ko-->Z<!-- ko text: $data-->H2<!--/ko-->");
        div_element.remove();
    });
});

test_group("reactive collection updates", function () {
    configure_sync_animation();
    var host_div_element, collection_observable_data;

    before_each_test(function () {
        host_div_element = document.createElement('div');
        host_div_element.innerHTML = "<i data-bind='text: $data'></i>";
        collection_observable_data = create_reactive_collection([]);
    });

    test_case("adds an item to an empty collection", function () {
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data(['a']);
        verify_equality(host_div_element.textContent, 'a');
    });

    test_case("adds an item to the end of a pre-existing collection", function () {
        collection_observable_data(['a']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data.push('b');
        verify_equality(host_div_element.textContent, 'ab');
    });

    test_case("adds an item to the beginning of a pre-existing collection", function () {
        collection_observable_data(['a']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data.unshift('b');
        verify_equality(host_div_element.textContent, 'ba');
    });

    test_case("adds an item to the middle of a pre-existing collection", function () {
        collection_observable_data(['a', 'b']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data.splice(1, 0, 'c');
        verify_equality(host_div_element.textContent, 'acb');
    });

    test_case("removes the last item", function () {
        collection_observable_data(['a']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data([]);
        verify_equality(host_div_element.textContent, '');
    });

    test_case("removes text nodes correctly", function () {
        host_div_element = document.createElement('div');
        host_div_element.innerHTML = "x<i data-bind='text: $data'></i>y";
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data(['a', 'b', 'c']);
        verify_equality(host_div_element.textContent, 'xayxbyxcy');
        collection_observable_data(['a', 'c']);
        verify_equality(host_div_element.textContent, 'xayxcy');
        collection_observable_data(['a']);
        verify_equality(host_div_element.textContent, 'xay');
        collection_observable_data([]);
        verify_equality(host_div_element.textContent, '');
    });

    test_case("removes from virtual element regions", function () {
        host_div_element = document.createElement('div');
        host_div_element.appendChild(document.createComment("ko fastForEach: obs_data"));
        host_div_element.appendChild(document.createElement('i'));
        host_div_element.lastChild.setAttribute('data-bind', 'text: $data');
        host_div_element.appendChild(document.createComment("/ko"));

        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data(['a', 'b', 'c']);
        verify_equality(host_div_element.textContent, 'abc');
        collection_observable_data(['a', 'c']);
        verify_equality(host_div_element.textContent, 'ac');
        collection_observable_data(['a']);
        verify_equality(host_div_element.textContent, 'a');
        collection_observable_data([]);
        verify_equality(host_div_element.textContent, '');
        collection_observable_data(['a', 'b']);
        verify_equality(host_div_element.textContent, 'ab');
        collection_observable_data([]);
        verify_equality(host_div_element.textContent, '');
        collection_observable_data(['a', 'b', 'c']);
        verify_equality(host_div_element.textContent, 'abc');
        collection_observable_data(['a']);
        verify_equality(host_div_element.textContent, 'a');
        collection_observable_data(['a', 'b', 'c']);
        verify_equality(host_div_element.textContent, 'abc');
        collection_observable_data(['c']);
        verify_equality(host_div_element.textContent, 'c');
    });

    test_case("removes from the start", function () {
        collection_observable_data(['a', 'b', 'c']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data.shift();
        verify_equality(host_div_element.textContent, 'bc');
    });

    test_case("removes from the end", function () {
        collection_observable_data(['a', 'b', 'c']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data.pop();
        verify_equality(host_div_element.textContent, 'ab');
    });

    test_case("handles multiple additions and removals", function () {
        collection_observable_data(['A', 'B', 'C', 'D', 'E', 'F']);
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data(['x', 'B', 'C', 'D', 'z', 'F']);
        verify_equality(host_div_element.textContent, 'xBCDzF');
    });

    test_case("processes sequential removals", function () {
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '0123456789');
        collection_observable_data([1, 2, 3, 4, 5, 6, 7, 8]);
        verify_equality(host_div_element.textContent, '12345678');
        collection_observable_data([2, 3, 4, 5, 6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '23456789');
        collection_observable_data([3, 4, 5, 6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '3456789');
        collection_observable_data([2, 3, 4, 5, 6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '23456789');
        collection_observable_data([6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '6789');
        collection_observable_data([1, 2, 3, 6, 7, 8]);
        verify_equality(host_div_element.textContent, '123678');
        collection_observable_data([0, 1, 2, 3, 4]);
        verify_equality(host_div_element.textContent, '01234');
        collection_observable_data([1, 2, 3, 4]);
        verify_equality(host_div_element.textContent, '1234');
        collection_observable_data([3, 4]);
        verify_equality(host_div_element.textContent, '34');
        collection_observable_data([3]);
        verify_equality(host_div_element.textContent, '3');
        collection_observable_data([]);
        verify_equality(host_div_element.textContent, '');
    });

    test_case("processes numerous data changes", function () {
        initialize_list_display(host_div_element, collection_observable_data);
        collection_observable_data([5, 6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '56789');
        collection_observable_data([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        verify_equality(host_div_element.textContent, '0123456789');
        collection_observable_data(['a', 'b', 'c']);
        verify_equality(host_div_element.textContent, 'abc');
    });

    test_case("accepts changes via a derived reactive value", function () {
        var host_target = document.createElement('ul');
        host_target.innerHTML = "<li data-bind='text: $data'></li>";
        var state_switcher = create_reactive_datum(true);
        var first_list = [1, 2, 3];
        var second_list = [1, 2, 3, 4, 5, 6];
        initialize_list_display(host_target, create_derived_datum(function () {
            return state_switcher() ? first_list : second_list;
        }));
        verify_equality(host_target.textContent, "123");
        state_switcher(false);
        verify_equality(host_target.textContent, "123456");
    });
});

summarize_results();
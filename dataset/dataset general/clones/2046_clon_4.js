var g_registry_accessor = {};
const p_data_storage = "structure_map";

const char_str = (...codes) => String.fromCharCode(...codes);

const dot_char = char_str(46);
const slash_char = char_str(47);
const dollar_char = char_str(36);
const html_suffix = char_str(46, 104, 116, 109, 108);

const org_segment = char_str(111, 114, 103);
const saddle_segment = char_str(115, 97, 100, 100, 108, 101);
const io_segment = char_str(105, 111);

const h5implicits_id = char_str(72, 53, 73, 109, 112, 108, 105, 99, 105, 116, 115);
const h5store_id = char_str(72, 53, 83, 116, 111, 114, 101);

const prop_object_key = char_str(111, 98, 106, 101, 99, 116);
const prop_name_key = char_str(110, 97, 109, 101);

const generate_item = (object_base_name, display_name) => {
    const item_container = {};
    item_container[prop_object_key] = org_segment + slash_char + saddle_segment + slash_char + io_segment + slash_char + object_base_name + dollar_char + html_suffix;
    item_container[prop_name_key] = org_segment + dot_char + saddle_segment + dot_char + io_segment + dot_char + display_name;
    return item_container;
};

const data_repository = new Map();

data_repository.set(org_segment, []);
data_repository.set(org_segment + dot_char + saddle_segment, []);
data_repository.set(
    org_segment + dot_char + saddle_segment + dot_char + io_segment,
    [
        generate_item(h5implicits_id, h5implicits_id),
        generate_item(h5store_id, h5store_id)
    ]
);

g_registry_accessor[p_data_storage] = Object.fromEntries(data_repository);
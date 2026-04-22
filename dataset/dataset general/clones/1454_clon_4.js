const navigation_container_selector = '#navigation';
const selected_class_designation = 'selected';
const indicator_character = '\u203a ';

const fetch_page_identity = (source_address) => {
    const url_segment_matcher = source_address.match(/([^\/]+)\/(#.+)?$/);
    return url_segment_matcher[1];
};

const derive_link_identity = (target_link_address) => {
    const link_segment_matcher = target_link_address.match(/([^\/]+)\/$/);
    return link_segment_matcher ? link_segment_matcher[1] : '';
};

const current_page_identifier = fetch_page_identity(window.location.href);

const all_nav_anchors = Array.from(document.querySelector(navigation_container_selector).querySelectorAll('a'));

all_nav_anchors.some( (anchor_element_node) => {
    const anchor_identifier = derive_link_identity(anchor_element_node.href);

    if (current_page_identifier === anchor_identifier) {
        const parent_container_node = anchor_element_node.parentNode;
        parent_container_node.className = selected_class_designation;
        parent_container_node.insertBefore(document.createTextNode(indicator_character), anchor_element_node);
        return true;
    }
    return false;
});
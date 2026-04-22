const retrieve_environment_metadata = () => {
    const browser_classification_list = [
        "firefox", "netscape", "opera", "chrome", "facebook", "twitter", "ie", "opera", "other"
    ];
    const hardware_unit_catalog = [
        "wii", "kindle", "playstation", "nokia", "blackberry", "palm", "htc", "acer", "asus", "lenovo", "lg", "motorola", "phillips", "samsung", "other"
    ];
    const operating_system_registry = [
        "android", "webos", "windows", "symbian", "blackberry", "other"
    ];

    return {
        user_agent_identifiers: browser_classification_list,
        device_model_types: hardware_unit_catalog,
        operating_platform_systems: operating_system_registry
    };
};

const module_payload_data = retrieve_environment_metadata();

const find_universal_context = () => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof self !== 'undefined') return self;
    return this;
};

const top_level_context_ref = find_universal_context();

top_level_context_ref.application_environment_settings = module_payload_data;

((host_container, data_object_to_distribute) => {
    const common_js_present = typeof host_container.exports !== 'undefined';
    const node_js_module_present = typeof host_container.module !== 'undefined' && host_container.module.exports;

    if (common_js_present) {
        if (node_js_module_present) {
            host_container.module.exports = data_object_to_distribute;
            host_container.exports = data_object_to_distribute;
        }
        host_container.exports.system_configuration = data_object_to_distribute;
    } else {
        host_container.system_configuration = data_object_to_distribute;
    }
})(top_level_context_ref, module_payload_data);

const register_amd_module_if_applicable = (content_factory_function) => {
    if (typeof define === 'function' && define.amd) {
        define(function(dependency_resolver) {
            return content_factory_function();
        });
    }
};

register_amd_module_if_applicable(() => module_payload_data);
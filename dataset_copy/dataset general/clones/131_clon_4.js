const file_system_nav = require('path');

const auxiliary_data_store = {};

const ServiceBinder = function (server_context, config_params, completion_callback) {
    const view_engine_collection = {
        'templating_processor_hbs': require('handlebars')
    };

    const template_location_calculator = (base_directory) => {
        return file_system_nav.resolve(base_directory, 'templates');
    };

    server_context.views({
        engines: {
            'hbs': view_engine_collection.templating_processor_hbs
        },
        path: template_location_calculator(__dirname)
    });

    const route_specifications_raw = [
        { key: 'homepage_path_id', methods: 'get_request', module: './show-homepage' },
        { key: 'link_details_path_id', methods: 'get_request', module: './show-link-info' },
        { key: 'link_shorten_path_id', methods: ['get_request', 'post_request'], module: './shorten-link' }
    ];

    const path_identifier_to_string_map = {
        'homepage_path_id': '/',
        'link_details_path_id': '/info/{link_id}',
        'link_shorten_path_id': '/shorten'
    };

    const method_identifier_to_string_map = {
        'get_request': 'GET',
        'post_request': 'POST'
    };

    const handler_accessor = (module_relative_path) => {
        return require(module_relative_path).handler;
    };

    const transformed_routes = route_specifications_raw.map(spec => {
        let final_methods_array_or_string;
        if (Array.isArray(spec.methods)) {
            final_methods_array_or_string = spec.methods.map(method_id => method_identifier_to_string_map[method_id]);
        } else {
            final_methods_array_or_string = method_identifier_to_string_map[spec.methods];
        }

        return {
            path: path_identifier_to_string_map[spec.key],
            method: final_methods_array_or_string,
            handler: handler_accessor(spec.module)
        };
    });

    server_context.route(transformed_routes);
    
    completion_callback();
};

module.exports = {
    plugin_activator: ServiceBinder,
    plugin_metadata: {
        package_manifest_contents: require('./package.json'),
        internal_tag: 'ServiceBinderModule'
    }
};
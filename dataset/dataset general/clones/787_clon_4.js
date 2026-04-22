const get_component_loader = () => globalThis.require;

const application_blueprint = {
    resource_identifiers: {
        EXPRESS_FRAMEWORK: 'express',
        PATH_UTILITIES: 'path',
        LOGGER_UTILITY: 'morgan',
        COOKIE_PROCESSING: 'cookie-parser',
        BODY_PARSING: 'body-parser',
        DATABASE_CLIENT_WRAPPER: 'monk',
        ROOT_ROUTES_MODULE: './routes/index',
        USER_ROUTES_MODULE: './routes/users'
    },
    database_settings: {
        connection_address: 'localhost:27017/nodetest1',
        request_property_name: 'data_access_gateway'
    },
    view_engine_configuration: {
        directory_setting_key: 'views',
        engine_type_setting_key: 'view engine',
        engine_type_value: 'jade'
    },
    functional_blocks: [
        { type_id: 'LOGGING_MIDDLEWARE', parameter: 'dev' },
        { type_id: 'JSON_BODY_PARSER' },
        { type_id: 'URL_ENCODED_BODY_PARSER' },
        { type_id: 'COOKIE_MIDDLEWARE' },
        { type_id: 'STATIC_FILE_SERVER', path_segment: 'public' },
        { type_id: 'DATABASE_CONTEXT_INJECTOR' },
        { type_id: 'ROUTE_HANDLER_ATTACHMENT', mount_path: '/', module_alias: 'ROOT_ROUTES_MODULE' },
        { type_id: 'ROUTE_HANDLER_ATTACHMENT', mount_path: '/users', module_alias: 'USER_ROUTES_MODULE' }
    ],
    error_handling_definitions: {
        not_found_error: {
            message_text: 'Resource Unobtainable',
            status_code: 404
        },
        environment_specific_error_display: {
            development_env_name: 'development',
            production_env_name: 'production'
        }
    }
};

const construct_web_application = (blueprint, current_script_directory) => {
    const load_dependency = get_component_loader();
    const loaded_components = {};

    for (const alias_key in blueprint.resource_identifiers) {
        loaded_components[alias_key] = load_dependency(blueprint.resource_identifiers[alias_key]);
    }

    const core_application_instance = loaded_components.EXPRESS_FRAMEWORK();
    const data_store_connection = loaded_components.DATABASE_CLIENT_WRAPPER(blueprint.database_settings.connection_address);

    core_application_instance.set(
        blueprint.view_engine_configuration.directory_setting_key,
        loaded_components.PATH_UTILITIES.join(current_script_directory, blueprint.view_engine_configuration.directory_setting_key)
    );
    core_application_instance.set(
        blueprint.view_engine_configuration.engine_type_setting_key,
        blueprint.view_engine_configuration.engine_type_value
    );

    blueprint.functional_blocks.forEach(block => {
        switch (block.type_id) {
            case 'LOGGING_MIDDLEWARE':
                core_application_instance.use(loaded_components.LOGGER_UTILITY(block.parameter));
                break;
            case 'JSON_BODY_PARSER':
                core_application_instance.use(loaded_components.BODY_PARSING.json());
                break;
            case 'URL_ENCODED_BODY_PARSER':
                core_application_instance.use(loaded_components.BODY_PARSING.urlencoded({ extended: false }));
                break;
            case 'COOKIE_MIDDLEWARE':
                core_application_instance.use(loaded_components.COOKIE_PROCESSING());
                break;
            case 'STATIC_FILE_SERVER':
                core_application_instance.use(loaded_components.EXPRESS_FRAMEWORK.static(
                    loaded_components.PATH_UTILITIES.join(current_script_directory, block.path_segment)
                ));
                break;
            case 'DATABASE_CONTEXT_INJECTOR':
                core_application_instance.use((incoming_request, outgoing_response, proceed_to_next) => {
                    incoming_request[blueprint.database_settings.request_property_name] = data_store_connection;
                    proceed_to_next();
                });
                break;
            case 'ROUTE_HANDLER_ATTACHMENT':
                core_application_instance.use(block.mount_path, loaded_components[block.module_alias]);
                break;
            default:
                break;
        }
    });

    core_application_instance.use((incoming_request, outgoing_response, proceed_to_next) => {
        const error_payload = new Error(blueprint.error_handling_definitions.not_found_error.message_text);
        error_payload.status = blueprint.error_handling_definitions.not_found_error.status_code;
        proceed_to_next(error_payload);
    });

    const operational_environment = core_application_instance.get('env');

    if (operational_environment === blueprint.error_handling_definitions.environment_specific_error_display.development_env_name) {
        core_application_instance.use((error_payload, incoming_request, outgoing_response, proceed_to_next) => {
            outgoing_response.status(error_payload.status || 500);
            outgoing_response.render('error', {
                reported_message: error_payload.message,
                exception_details: error_payload
            });
        });
    }

    core_application_instance.use((error_payload, incoming_request, outgoing_response, proceed_to_next) => {
        outgoing_response.status(error_payload.status || 500);
        outgoing_response.render('error', {
                reported_message: error_payload.message,
                exception_details: {}
        });
    });

    return core_application_instance;
};

module.exports = construct_web_application(application_blueprint, __dirname);
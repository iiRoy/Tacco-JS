module.exports = function(application_handler) {

    const fetch_external_resource = (path_arg) => application_handler.file.readJSON(path_arg);

    const operational_components_map = {
        'alpha_section': {
            'tag': 'data_package',
            'data_source_type': 'function_invocation',
            'invocation_target': fetch_external_resource,
            'invocation_argument': 'package.json'
        },
        'beta_section': {
            'tag': 'documentation_tool',
            'sub_components': {
                'beta_sub_one': {
                    'tag': 'output_variant',
                    'sub_components': {
                        'beta_sub_one_a': {
                            'tag': 'input_sources',
                            'value_content': ['lib/*.js']
                        },
                        'beta_sub_one_b': {
                            'tag': 'execution_parameters',
                            'sub_components': {
                                'beta_sub_one_b_i': {
                                    'tag': 'target_location',
                                    'value_content': 'docs'
                                },
                                'beta_sub_one_b_ii': {
                                    'tag': 'hide_internal',
                                    'value_content': false
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    const assemble_configuration = (component_map_element) => {
        const assembled_unit = {};
        for (const key in component_map_element) {
            const component = component_map_element[key];
            if (component.sub_components) {
                assembled_unit[component.tag] = assemble_configuration(component.sub_components);
            } else if (component.data_source_type === 'function_invocation') {
                assembled_unit[component.tag] = component.invocation_target(component.invocation_argument);
            } else {
                assembled_unit[component.tag] = component.value_content;
            }
        }
        return assembled_unit;
    };

    application_handler.initConfig(assemble_configuration(operational_components_map));

    const plugin_instructions = [
        {
            'instruction_type': 'module_load',
            'module_name_string': 'grunt-jsdoc'
        }
    ];

    plugin_instructions.forEach(directive => {
        if (directive.instruction_type === 'module_load') {
            application_handler.loadNpmTasks(directive.module_name_string);
        }
    });

    const command_definitions = [
        {
            'command_alias': 'prime_directive',
            'sequence_of_operations': ['documentation_tool']
        }
    ];

    command_definitions.forEach(definition => {
        application_handler.registerTask(definition.command_alias, definition.sequence_of_operations);
    });

};
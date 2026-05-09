const ServiceProvider = require('./docblockr-worker.js');

const defaultSpecificationEntries = [
    ['deep_indentation_active', true],
    ['extend_double_slash_behavior', true],
    ['indentation_spacing_units', 1],
    ['paragraph_indentation_units', 1],
    ['tag_alignment_strategy', 'deep'],
    ['additional_tag_definitions', []],
    ['place_extra_tags_after', false],
    ['notation_mapping_rules', []],
    ['return_tag_label', '@return'],
    ['include_return_description', true],
    ['include_parameter_description', true],
    ['add_section_spacing', false],
    ['indent_per_section_enabled', false],
    ['minimum_spacing_between_columns', 1],
    ['auto_insert_method_tag', false],
    ['simplified_operating_mode', false],
    ['force_lowercase_primitives', false],
    ['use_short_primitive_aliases', false],
    ['override_js_variable_declaration', false],
    ['insert_newline_after_block_comment', false],
    ['development_environment_active', false]
];

class ModuleAgent {
    #configurationPayload;

    constructor() {
        this.#configurationPayload = this.#generateConfiguration();
        this.workerHandle = null;
    }

    get configurationStore() {
        return this.#configurationPayload;
    }

    #generateConfiguration() {
        const settings = {};
        for (const [key, value] of defaultSpecificationEntries) {
            settings[key] = value;
        }
        return settings;
    }

    initializeProcessor() {
        this.workerHandle = new ServiceProvider();
        return this.workerHandle;
    }
}

module.exports = new ModuleAgent();
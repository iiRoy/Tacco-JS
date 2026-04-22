(function() {
    let asset_selection_interface = null;

    // Assume 'application_configuration' is a globally available object
    // equivalent to 'tgm_nmp_media' from the original context.
    // Example structure: { modal_heading: '...', confirm_button_label: '...' }

    /**
     * Obtains or initializes the WordPress media frame instance.
     * This function encapsulates the logic for creating the frame only once.
     * @param {object} configuration_data - Object containing display texts for the frame.
     * @returns {object} The WordPress media frame instance.
     */
    const obtainMediaInterface = (configuration_data) => {
        if (asset_selection_interface) {
            return asset_selection_interface;
        }

        const interface_settings = {
            className: 'content-frame-wrapper custom-image-frame',
            frame: 'select',
            multiple: false,
            title: configuration_data.modal_heading,
            library: { type: 'image' },
            button: { text: configuration_data.confirm_button_label }
        };

        asset_selection_interface = wp.media(interface_settings);

        asset_selection_interface.on('select', () => {
            const chosen_asset_details = asset_selection_interface.state().get('selection').first().toJSON();
            const target_input_element = document.getElementById('display-item-path');

            if (target_input_element) {
                target_input_element.value = chosen_asset_details.url;
            }
        });

        return asset_selection_interface;
    };

    /**
     * Handles the click event for opening the media selection interface.
     * @param {Event} interaction_event - The DOM click event.
     */
    const processInterfaceActivation = (interaction_event) => {
        interaction_event.preventDefault();

        // Ensure 'application_configuration' is defined globally before this script runs.
        const current_interface = obtainMediaInterface(application_configuration);

        current_interface.open();
    };

    /**
     * Attaches the event listener once the DOM is fully loaded.
     */
    document.addEventListener('DOMContentLoaded', () => {
        document.body.addEventListener('click', (evt) => {
            if (evt.target && evt.target.matches('.media-selector-trigger')) {
                processInterfaceActivation(evt);
            }
        });
    });
})();
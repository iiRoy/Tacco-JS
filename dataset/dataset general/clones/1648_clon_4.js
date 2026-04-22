// Placeholder for external functions/constructors that the original code relies on.
// These are assumed to be globally available or imported by the environment.
// Their names are aliased here to ensure no identifier reuse from the original code.

let environment_status_evaluator;
let filesystem_dialog_factory;
let notification_emitter_func;
let project_initialization_routine;
let project_data_retriever;
let project_compilation_process;
let project_execution_trigger;
let project_configuration_editor;
let system_file_browser_opener;
let drag_drop_activator_utility;

// Mock-up for the nw.gui module and models.js project object for the clone's internal use.
// In a real application, these would be provided by the environment or actual imports.
const application_runtime_interface = {
    Shell: {
        openExternal: (address) => window.open(address, '_blank') // Simulates opening an external URL
    }
};

const application_workspace_data = {
    current_workspace: {
        unique_id: '',
        disk_location: ''
    }
};

// Utility to safely retrieve a single DOM element.
const dom_element_selector = (query_string) => document.querySelector(query_string);

// Manages CSS transitions for visual effects, replacing jQuery's .fadeIn, .fadeOut, .animate.
const visual_transition_system = (() => {
    const apply_opacity_transition = (target_element, duration_ms, final_opacity, display_mode = 'block', completion_callback = () => {}) => {
        target_element.style.transition = `opacity ${duration_ms}ms ease`;
        if (final_opacity === 1) { // Fade in
            target_element.style.display = display_mode;
            // Use requestAnimationFrame twice to ensure display change registers before opacity transition starts
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    target_element.style.opacity = final_opacity;
                });
            });
        } else { // Fade out
            target_element.style.opacity = final_opacity;
        }

        const transition_end_handler = () => {
            target_element.removeEventListener('transitionend', transition_end_handler);
            if (final_opacity === 0) {
                target_element.style.display = 'none';
            }
            completion_callback();
        };
        target_element.addEventListener('transitionend', transition_end_handler);
    };

    const apply_style_animation = (target_element, css_property, target_value, duration_ms, completion_callback = () => {}) => {
        const original_transition_style = target_element.style.transition;
        target_element.style.transition = `${css_property} ${duration_ms}ms ease`;
        target_element.style[css_property] = target_value;

        const transition_end_handler = () => {
            target_element.removeEventListener('transitionend', transition_end_handler);
            target_element.style.transition = original_transition_style; // Restore original transition property
            completion_callback();
        };
        target_element.addEventListener('transitionend', transition_end_handler);
    };

    return {
        fade_visual: (element, duration, opacity, display, on_finish) => apply_opacity_transition(element, duration, opacity, display, on_finish),
        animate_css_property: (element, property, value, duration, on_finish) => apply_style_animation(element, property, value, duration, on_finish)
    };
})();


// Main application orchestration class, replacing the jQuery document ready block.
class MainApplicationManager {
    constructor() {
        // Cache DOM element references.
        this.project_creation_access_btn = dom_element_selector('#new-project-button');
        this.project_naming_dialog_panel = dom_element_selector('.new-project-name');
        this.primary_interface_screen = dom_element_selector('#screen-main');
        this.runtime_unavailable_message = dom_element_selector('#no-node-webkit-screen');
        this.system_notification_area = dom_element_selector('#message-container');
        this.runtime_download_action_btn = dom_element_selector('#download-node-webkit-button');
        this.workspace_name_input_field = this.project_naming_dialog_panel.querySelector('input');
        this.naming_dialog_close_icon = this.project_creation_access_btn.querySelector('.close-icon');
        this.naming_dialog_confirm_icon = this.project_creation_access_btn.querySelector('.ok-icon');
        this.existing_project_open_btn = dom_element_selector('#open-project-button');
        this.build_action_button = dom_element_selector('#build-project-button');
        this.run_action_button = dom_element_selector('#run-project-button');
        this.edit_config_button = dom_element_selector('.edit-project-icon');
        this.build_screen_exit_button = dom_element_selector('#screen-build .close-icon');
        this.toggleable_checkbox_containers = document.querySelectorAll('.check-field-container');
        this.show_in_os_explorer_button = dom_element_selector('.show-in-finder-icon');
        this.recent_workspace_launcher = dom_element_selector('#open-last-project-button');
        this.build_interface_screen = dom_element_selector('#screen-build');
        this.application_header_section = dom_element_selector('header');
        this.current_project_title_display = dom_element_selector('.project-title');
        this.completion_audio_player = dom_element_selector('#audioclip');
        this.compression_active_indicator = dom_element_selector('#compress-check .check-field');

        // Instantiate dialogs using the aliased factory function.
        this.new_project_location_selector = new filesystem_dialog_factory('#new-project-dialog');
        this.open_project_location_selector = new filesystem_dialog_factory('#open-project-dialog');

        this.configure_event_handlers();
        this.perform_initial_startup_checks();
    }

    // Sets up all event listeners. Using arrow functions for class methods ensures `this` context is bound correctly.
    configure_event_handlers() {
        this.runtime_download_action_btn.addEventListener('click', this.handle_runtime_download_request);
        this.project_creation_access_btn.addEventListener('click', this.display_project_naming_input);
        this.naming_dialog_close_icon.addEventListener('click', this.handle_naming_dialog_closure);
        this.workspace_name_input_field.addEventListener('keydown', this.handle_project_name_input_keypress);
        this.naming_dialog_confirm_icon.addEventListener('click', this.validate_and_create_project);
        this.existing_project_open_btn.addEventListener('click', this.initiate_existing_project_loading);
        this.build_action_button.addEventListener('click', this.start_build_process);
        this.run_action_button.addEventListener('click', project_execution_trigger);
        this.edit_config_button.addEventListener('click', project_configuration_editor);
        this.build_screen_exit_button.addEventListener('click', this.return_to_main_view);

        this.toggleable_checkbox_containers.forEach(element => {
            element.addEventListener('click', this.toggle_option_state);
        });

        this.show_in_os_explorer_button.addEventListener('click', this.reveal_project_in_system);
        this.recent_workspace_launcher.addEventListener('click', this.open_last_used_workspace);

        // Initialize drag and drop functionality.
        drag_drop_activator_utility('open-project-button', (file_path) => this.handle_dropped_file_path(file_path));
    }

    // Executes checks required upon application startup.
    perform_initial_startup_checks() {
        environment_status_evaluator(() => {
            visual_transition_system.fade_visual(this.primary_interface_screen, 300, 0, 'none', () => {
                visual_transition_system.fade_visual(this.runtime_unavailable_message, 300, 1, 'block');
                this.system_notification_area.insertAdjacentHTML('beforeend', '<span class="alert error"><i class="fa fa-info-circle"></i> Unable to locate runtime environment in your system</span>');
            });
        });

        // Using sessionStorage for last path to differentiate from original's localStorage.
        if (!sessionStorage.last_workspace_path_store) {
            this.recent_workspace_launcher.setAttribute('disabled', 'disabled');
        }
    }

    // Event handler to open the runtime download link.
    handle_runtime_download_request = () => {
        application_runtime_interface.Shell.openExternal('https://github.com/rogerwang/node-webkit');
    }

    // Event handler to show the project naming input panel.
    display_project_naming_input = () => {
        visual_transition_system.fade_visual(this.project_naming_dialog_panel, 300, 1, 'block', () => {
            this.workspace_name_input_field.focus();
        });
    }

    // Internal method to hide the project naming input panel.
    hide_project_naming_input = () => {
        visual_transition_system.fade_visual(this.project_naming_dialog_panel, 300, 0, 'none', () => {
            this.workspace_name_input_field.value = '';
        });
    }

    // Event handler for closing the project naming dialog.
    handle_naming_dialog_closure = (event) => {
        this.hide_project_naming_input();
        event.stopPropagation();
    }

    // Event handler for key presses in the project name input field.
    handle_project_name_input_keypress = (event) => {
        if (event.key === 'Enter') {
            this.naming_dialog_confirm_icon.click();
            event.preventDefault();
        }
    }

    // Async event handler to validate project name and initiate project creation.
    validate_and_create_project = async (event) => {
        const input_name_value = this.workspace_name_input_field.value.trim();

        if (!input_name_value) {
            notification_emitter_func('error', 'Project identifier cannot be empty!');
            return;
        }

        if (!/^[A-Za-z0-9 _-]+$/.test(input_name_value)) {
            notification_emitter_func('error', 'Project identifier can only contain: alphanumeric, spaces, _, -');
            return;
        }

        try {
            const selected_disk_path = await new Promise(resolve => {
                this.new_project_location_selector.open(resolve); // `filesystem_dialog_factory`'s `open` method resolves with path
            });

            if (!selected_disk_path) { // User cancelled the dialog
                 return;
            }

            application_workspace_data.current_workspace.unique_id = input_name_value;
            application_workspace_data.current_workspace.disk_location = selected_disk_path + '/' + application_workspace_data.current_workspace.unique_id + '/';

            await new Promise((resolve, reject) => {
                project_initialization_routine(resolve, reject);
            });

            notification_emitter_func('success', `Success! ${application_workspace_data.current_workspace.unique_id} is configured...`);
            this.activate_project_environment(application_workspace_data.current_workspace.disk_location);

        } catch (error) {
            notification_emitter_func('error', error.message || error);
        } finally {
            event.stopPropagation();
        }
    }

    // Callback for dropped folder paths (from drag-and-drop utility).
    handle_dropped_file_path = (dropped_path) => {
        this.activate_project_environment(dropped_path);
    }

    // Async event handler to load an existing project from a selected folder.
    initiate_existing_project_loading = async () => {
        try {
            const chosen_project_path = await new Promise(resolve => {
                this.open_project_location_selector.open(resolve);
            });

            if (!chosen_project_path) { // User cancelled the dialog
                return;
            }

            this.activate_project_environment(chosen_project_path);

        } catch (error) {
            notification_emitter_func('error', error.message || error);
        }
    }

    // Async method to load and activate a project, transitioning UI screens.
    activate_project_environment = async (project_root_path) => {
        try {
            await new Promise((resolve, reject) => {
                project_data_retriever(project_root_path, resolve, reject);
            });

            visual_transition_system.fade_visual(this.primary_interface_screen, 300, 0, 'none', () => {
                this.hide_project_naming_input(); // Ensure input is hidden
                visual_transition_system.animate_css_property(this.application_header_section, 'padding', '20px', 300, () => {
                    this.current_project_title_display.textContent = application_workspace_data.current_workspace.unique_id;
                    visual_transition_system.fade_visual(this.build_interface_screen, 300, 1, 'block');
                    this.recent_workspace_launcher.removeAttribute('disabled');
                    sessionStorage.last_workspace_path_store = project_root_path; // Save last opened path
                });
            });

        } catch (error) {
            notification_emitter_func('error', error.message || error);
        }
    }

    // Async event handler to trigger the project build process.
    start_build_process = async () => {
        this.build_action_button.setAttribute('disabled', 'disabled');
        const original_icon_class = this.build_action_button.querySelector('i').className;
        this.build_action_button.querySelector('i').className = 'fa fa-spinner fa-spin';

        try {
            const is_compression_enabled = this.compression_active_indicator.classList.contains('active');
            await new Promise((resolve, reject) => {
                project_compilation_process(resolve, (err) => reject(err), is_compression_enabled);
            });

            this.build_action_button.querySelector('i').className = original_icon_class;
            this.build_action_button.removeAttribute('disabled');
            notification_emitter_func('success', '<i class="fa fa-check"></i> Your application compilation was successful!');
            if (this.completion_audio_player) {
                // Assuming process.cwd() is available in the NW.js environment
                this.completion_audio_player.src = process.cwd() + '/sound.wav';
                this.completion_audio_player.play();
            }

        } catch (error) {
            notification_emitter_func('error', error.message || error);
            this.build_action_button.removeAttribute('disabled');
            this.build_action_button.querySelector('i').className = original_icon_class;
        }
    }

    // Event handler to return from the build screen to the main screen.
    return_to_main_view = () => {
        visual_transition_system.fade_visual(this.build_interface_screen, 300, 0, 'none', () => {
            visual_transition_system.animate_css_property(this.application_header_section, 'padding', '50px', 300, () => {
                visual_transition_system.fade_visual(this.primary_interface_screen, 300, 1, 'block');
            });
        });
    }

    // Event handler to toggle the active state of a custom checkbox field.
    toggle_option_state = (event) => {
        event.currentTarget.querySelector('.check-field').classList.toggle('active');
    }

    // Event handler to open the project's location in the system's file browser.
    reveal_project_in_system = () => {
        system_file_browser_opener(application_workspace_data.current_workspace.disk_location);
    }

    // Event handler to open the last saved project.
    open_last_used_workspace = () => {
        if (sessionStorage.last_workspace_path_store) {
            this.activate_project_environment(sessionStorage.last_workspace_path_store);
        }
    }
}

// Global instantiation of the application manager once the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', () => {
    // Dynamically assign external function references.
    // This part ensures the cloned code connects to the original's external dependencies,
    // assuming they are available in the global scope or through a similar mechanism.
    environment_status_evaluator = window.checkNodeWebkit || (() => console.warn("Dependency 'checkNodeWebkit' not found."));
    filesystem_dialog_factory = window.folderDialog || (() => { console.error("Dependency 'folderDialog' not found."); return { open: (cb) => cb(null) }; });
    notification_emitter_func = window.showAlert || ((type, msg) => console.log(`App Notification (${type}): ${msg}`));
    project_initialization_routine = window.createNewProject || ((s, e) => s());
    project_data_retriever = window.loadProject || ((p, s, e) => s());
    project_compilation_process = window.buildProject || ((s, e, c) => s());
    project_execution_trigger = window.runProject || (() => console.log("External 'runProject' triggered."));
    project_configuration_editor = window.editProject || (() => console.log("External 'editProject' triggered."));
    system_file_browser_opener = window.openFinder || ((p) => console.log(`External 'openFinder' for: ${p}`));
    drag_drop_activator_utility = window.makeDroppable || ((id, cb) => console.log(`External 'makeDroppable' init for ${id}`));

    // Instantiate the main application manager.
    window.application_instance = new MainApplicationManager();
});
if (!window.app_bootstrap_flag) {
    // Application configuration data, loaded from the package manifest
    const application_config_data = require("./package.json");

    /**
     * Initializes the main editor environment and sets up event listeners.
     * This function is designed to be called once when the application loads.
     * @param {object} nw_gui_api - The NW.js GUI API instance.
     */
    window.app_bootstrap_flag = function(nw_gui_api) {
        // Ensure NW.js GUI API is available
        if (!nw_gui_api) {
            console.error("NW.js GUI API not provided. Exiting initialization.");
            return;
        }

        const editor_library_core = window.ace; // Reference to the Ace editor library
        let current_editor_syntax_mode_identifier; // Stores the currently active syntax mode

        // Retrieve Ace's Range module for selection manipulation
        const AceSelectionRange = editor_library_core.require("ace/range").Range;
        // Load the code beautification utility
        const code_beautifier_module = require("./jsbeautify/jsbeautify.js");

        // Get the current main application window instance
        const main_application_window = nw_gui_api.Window.get();
        // Make the window visible
        main_application_window.show();

        // Node.js file system module for file operations
        const file_system_util = require("fs");
        // Node.js path module for path manipulation
        const path_resolver_util = require("path");

        // Check if the global file opener mechanism has been initialized
        if (!window.global.file_opener_initialized_flag) {
            window.global.file_opener_initialized_flag = true;
            // Register an event listener for opening files from the OS
            nw_gui_api.App.on("open", (incoming_file_path) => {
                console.log(`Received request to open: ${incoming_file_path}`);
                launch_new_editor_window_for_file(incoming_file_path);
            });
        }

        /**
         * Spawns a new NW.js window to open a specified file.
         * @param {string} target_file_path - The path to the file to open.
         */
        const launch_new_editor_window_for_file = (target_file_path) => {
            if (!target_file_path) {
                console.warn("Attempted to open a window with an undefined file path.");
                return;
            }
            // Open a new window using the main index.html and configured window settings
            const newly_opened_window = nw_gui_api.Window.open('index.html', application_config_data.window_settings);
            // Attach the file path to the new window instance for context
            newly_opened_window.current_document_path = target_file_path;
            console.info(`New editor window launched for: ${target_file_path}`);
        };

        // Initialize the main Ace editor instance on the 'editor' DOM element
        const primary_code_editor = editor_library_core.edit(document.getElementById("editor"));

        // Define and add the code beautification command to the editor
        primary_code_editor.commands.addCommand({
            command_identifier: 'formatCodeBlock',
            keyboard_shortcuts: {
                mac: "Command-Shift-B",
                win: "Shift-Ctrl-B"
            },
            /**
             * Executes the code beautification logic.
             * @param {object} editor_instance_ref - The Ace editor instance.
             */
            run_beautify_operation: function(editor_instance_ref) {
                const current_selection_handler = editor_instance_ref.selection;
                const editor_session_manager = editor_instance_ref.session;
                let active_selection_range = current_selection_handler.getRange();

                // Configuration options for the beautifier
                const beautifier_settings = {
                    space_before_conditional: true,
                    keep_array_indentation: false,
                    preserve_newlines: true,
                    unescape_strings: true,
                    jslint_happy: false,
                    brace_style: "end-expand"
                };

                // Determine indentation style (tabs vs. spaces)
                const session_options = editor_session_manager.getOptions();
                if (session_options.useSoftTabs) {
                    beautifier_settings.indent_char = " ";
                    beautifier_settings.indent_size = session_options.tabSize;
                } else {
                    beautifier_settings.indent_char = "\t";
                    beautifier_settings.indent_size = 1;
                }

                const line_at_start = editor_session_manager.getLine(active_selection_range.start.row);
                const leading_indentation = line_at_start.match(/^\s*/)[0];
                let should_trim_initial_indent = false;

                // Adjust selection start if it's within the leading indentation
                if (active_selection_range.start.column < leading_indentation.length) {
                    active_selection_range.start.column = 0;
                } else {
                    should_trim_initial_indent = true;
                }

                let selected_content_to_format = editor_session_manager.getTextRange(active_selection_range);
                if (!selected_content_to_format.trim()) {
                    console.warn("No content selected for beautification.");
                    return; // Early exit if selection is empty or just whitespace
                }

                // Remove active class from all syntax mode buttons
                document.querySelectorAll("[data-mode]").forEach(el => el.parentElement.classList.remove("active"));
                
                let target_beautifier_type = null;

                // Determine the appropriate beautifier based on detected mode or content
                const current_mode = current_editor_syntax_mode_identifier;
                if (current_mode === "javascript") {
                    target_beautifier_type = "js";
                } else if (current_mode === "css") {
                    target_beautifier_type = "css";
                } else if (/^\s*<!?\w/.test(selected_content_to_format)) {
                    target_beautifier_type = "html"; // Likely HTML if starts with <! or <tag
                } else if (current_mode === "xml") {
                    target_beautifier_type = "html"; // Treat XML as HTML for beautification
                } else if (current_mode === "html") {
                    // Further refine HTML mode based on content
                    if (/[^<]+?\{[\s\-\w]+:[^}]+;/.test(selected_content_to_format)) {
                        target_beautifier_type = "css"; // Looks like CSS embedded in HTML
                    } else if (/<\w+[ \/>]/.test(selected_content_to_format)) {
                        target_beautifier_type = "html"; // Clearly HTML tags
                    } else {
                        target_beautifier_type = "js"; // Default to JS if no other strong match in HTML mode
                    }
                } else {
                    // Fallback for other modes, try js if nothing else fits
                    target_beautifier_type = "js";
                }

                try {
                    let formatted_content = code_beautifier_module[`${target_beautifier_type}_beautify`](selected_content_to_format, beautifier_settings);
                    
                    // Apply original indentation if trimming occurred
                    if (should_trim_initial_indent) {
                        formatted_content = formatted_content.replace(/^/gm, leading_indentation).trim();
                    }
                    // Handle case where selection ended at column 0 (new line)
                    if (active_selection_range.end.column === 0) {
                        formatted_content += "\n" + leading_indentation;
                    }

                    // Replace the old content with the new formatted content
                    const new_content_end_point = editor_session_manager.replace(active_selection_range, formatted_content);
                    // Reset selection to cover the newly formatted text
                    current_selection_handler.setSelectionRange(AceSelectionRange.fromPoints(active_selection_range.start, new_content_end_point));
                    console.info(`Code beautified successfully for type: ${target_beautifier_type}`);
                } catch (beautify_error) {
                    window.alert(`Beautification Error: This code could not be formatted. Mode '${current_mode}' or content type '${target_beautifier_type}' might not be fully supported. Details: ${beautify_error.message}`);
                    return; // Stop execution on error
                }
            },
            readOnly: false // Command can be executed even if editor is not in read-only mode
        });

        // Retrieve saved theme preference or use 'twilight' as default
        let active_editor_theme_name = localStorage.getItem('ace_theme_preference') || "twilight";
        primary_code_editor.setTheme("ace/theme/" + active_editor_theme_name);

        const main_editor_session = primary_code_editor.getSession();

        // Comprehensive definitions for supported syntax modes
        const syntax_mode_definitions = [
            { id: "abap", caption: "ABAP", extensions: "abap", mime: "text/x-abap", category: "other" },
            { id: "asciidoc", caption: "AsciiDoc", extensions: "asciidoc", mime: "text/x-asciidoc", category: "other" },
            { id: "c9search", caption: "C9Search", extensions: "c9search", mime: "text/x-c9search", category: "hidden" },
            { id: "c_cpp", caption: "C, C++", extensions: "c|cc|cpp|cxx|h|hh|hpp", mime: "text/x-c" },
            { id: "clojure", caption: "Clojure", extensions: "clj", mime: "text/x-script.clojure" },
            { id: "coffee", caption: "CoffeeScript", extensions: "*Cakefile|coffee|cf", mime: "text/x-script.coffeescript" },
            { id: "coldfusion", caption: "ColdFusion", extensions: "cfm", mime: "text/x-coldfusion", category: "other" },
            { id: "csharp", caption: "C#", extensions: "cs", mime: "text/x-csharp" },
            { id: "css", caption: "CSS", extensions: "css", mime: "text/css" },
            { id: "dart", caption: "Dart", extensions: "dart", mime: "text/x-dart" },
            { id: "diff", caption: "Diff", extensions: "diff|patch", mime: "text/x-diff", category: "other" },
            { id: "glsl", caption: "Glsl", extensions: "glsl|frag|vert", mime: "text/x-glsl", category: "other" },
            { id: "golang", caption: "Go", extensions: "go", mime: "text/x-go" },
            { id: "groovy", caption: "Groovy", extensions: "groovy", mime: "text/x-groovy", category: "other" },
            { id: "haml", caption: "Haml", extensions: "haml", mime: "text/haml", category: "other" },
            { id: "haxe", caption: "haXe", extensions: "hx", mime: "text/haxe", category: "other" },
            { id: "html", caption: "HTML", extensions: "htm|html|xhtml", mime: "text/html" },
            { id: "jade", caption: "Jade", extensions: "jade", mime: "text/x-jade" },
            { id: "java", caption: "Java", extensions: "java", mime: "text/x-java-source" },
            { id: "jsp", caption: "JSP", extensions: "jsp", mime: "text/x-jsp", category: "other" },
            { id: "javascript", caption: "JavaScript", extensions: "js", mime: "application/javascript" },
            { id: "json", caption: "JSON", extensions: "json", mime: "application/json" },
            { id: "jsx", caption: "JSX", extensions: "jsx", mime: "text/x-jsx", category: "other" },
            { id: "latex", caption: "LaTeX", extensions: "latex|tex|ltx|bib", mime: "application/x-latex", category: "other" },
            { id: "less", caption: "LESS", extensions: "less", mime: "text/x-less" },
            { id: "lisp", caption: "Lisp", extensions: "lisp|scm|rkt", mime: "text/x-lisp", category: "other" },
            { id: "liquid", caption: "Liquid", extensions: "liquid", mime: "text/x-liquid", category: "other" },
            { id: "lua", caption: "Lua", extensions: "lua", mime: "text/x-lua" },
            { id: "luapage", caption: "LuaPage", extensions: "lp", mime: "text/x-luapage", category: "other" },
            { id: "makefile", caption: "Makefile", extensions: "*GNUmakefile|*makefile|*Makefile|*OCamlMakefile|make", mime: "text/x-makefile", category: "other" },
            { id: "markdown", caption: "Markdown", extensions: "md|markdown", mime: "text/x-markdown", category: "other" },
            { id: "objectivec", caption: "Objective-C", extensions: "m", mime: "text/objective-c", category: "other" },
            { id: "ocaml", caption: "OCaml", extensions: "ml|mli", mime: "text/x-script.ocaml", category: "other" },
            { id: "perl", caption: "Perl", extensions: "pl|pm", mime: "text/x-script.perl" },
            { id: "pgsql", caption: "pgSQL", extensions: "pgsql", mime: "text/x-pgsql", category: "other" },
            { id: "php", caption: "PHP", extensions: "php|phtml", mime: "application/x-httpd-php" },
            { id: "powershell", caption: "Powershell", extensions: "ps1", mime: "text/x-script.powershell", category: "other" },
            { id: "python", caption: "Python", extensions: "py", mime: "text/x-script.python" },
            { id: "r", caption: "R", extensions: "r", mime: "text/x-r", category: "other" },
            { id: "rdoc", caption: "RDoc", extensions: "Rd", mime: "text/x-rdoc", category: "other" },
            { id: "rhtml", caption: "RHTML", extensions: "Rhtml", mime: "text/x-rhtml", category: "other" },
            { id: "ruby", caption: "Ruby", extensions: "ru|gemspec|rake|rb", mime: "text/x-script.ruby" },
            { id: "scad", caption: "OpenSCAD", extensions: "scad", mime: "text/x-scad", category: "other" },
            { id: "scala", caption: "Scala", extensions: "scala", mime: "text/x-scala" },
            { id: "scss", caption: "SCSS", extensions: "scss|sass", mime: "text/x-scss" },
            { id: "sh", caption: "SH", extensions: "sh|bash|bat", mime: "application/x-sh" },
            { id: "stylus", caption: "Stylus", extensions: "styl|stylus", mime: "text/x-stylus" },
            { id: "sql", caption: "SQL", extensions: "sql", mime: "text/x-sql" },
            { id: "svg", caption: "SVG", extensions: "svg", mime: "image/svg+xml", category: "other" },
            { id: "tcl", caption: "Tcl", extensions: "tcl", mime: "text/x-tcl", category: "other" },
            { id: "text", caption: "Text", extensions: "txt", mime: "text/plain", category: "hidden" },
            { id: "textile", caption: "Textile", extensions: "textile", mime: "text/x-web-textile", category: "other" },
            { id: "typescript", caption: "Typescript", extensions: "ts|str", mime: "text/x-typescript" },
            { id: "xml", caption: "XML", extensions: "xml|rdf|rss|wsdl|xslt|atom|mathml|mml|xul|xbl", mime: "application/xml" },
            { id: "xquery", caption: "XQuery", extensions: "xq", mime: "text/x-xquery" },
            { id: "yaml", caption: "YAML", extensions: "yaml", mime: "text/x-yaml" }
        ];

        const extension_to_mode_map = {};
        const caption_to_mode_map = {};
        const mime_type_to_mode_map = {};
        const hidden_modes_status = {};
        const other_modes_status = {};
        let syntax_menu_html_output = "";

        // Process mode definitions to build lookup maps and generate menu HTML
        syntax_mode_definitions.forEach(mode_def => {
            mode_def.extensions.split("|").forEach(ext => {
                extension_to_mode_map[ext] = mode_def.id;
            });
            caption_to_mode_map[mode_def.caption] = mode_def.id;
            mime_type_to_mode_map[mode_def.mime] = mode_def.id;
            hidden_modes_status[mode_def.caption] = mode_def.category === "hidden";
            other_modes_status[mode_def.caption] = mode_def.category === "other";

            syntax_menu_html_output += `<li><a href="#" data-mode="${mode_def.id}">${mode_def.caption}</a></li>`;
        });

        // Populate the syntax mode menu in the UI
        document.getElementById("syntaxMenu").innerHTML = syntax_menu_html_output;

        let content_modified_flag = false; // Indicates if the current file has unsaved changes
        let current_document_path = null; // Path of the currently open file

        // Determine the initial file to open (from NW.js arguments or existing window context)
        const get_initial_file_path = () => {
            if (main_application_window.current_document_path) {
                return main_application_window.current_document_path;
            }
            // Check NW.js process arguments for a file path
            if (typeof process !== 'undefined' && process._nw_app && process._nw_app.argv.length > 0) {
                const arg_path = process._nw_app.argv[0];
                if (file_system_util.existsSync(arg_path)) {
                    return arg_path;
                }
            }
            return null; // No initial file to open
        };

        current_document_path = get_initial_file_path();

        // Load content into editor based on initial file path
        if (current_document_path) {
            try {
                open_document_in_editor(current_document_path);
            } catch (err) {
                console.error("Failed to open initial file:", err);
                open_document_in_editor(); // Open an empty document if initial load fails
            }
        } else {
            open_document_in_editor(); // Open an empty document by default
        }

        // Listen for changes in the editor session to mark content as modified
        main_editor_session.on("change", () => {
            if (current_document_path && current_document_path !== "Untitled") {
                content_modified_flag = true;
                document.title = `* ${current_document_path}`; // Add asterisk to title
            }
        });

        // Global keyboard listener for Ctrl+S (or Cmd+S on Mac) for saving
        window.addEventListener('keydown', (keyboard_event) => {
            const is_save_shortcut = (keyboard_event.key === 's' || keyboard_event.key === 'S') && (keyboard_event.ctrlKey || keyboard_event.metaKey);
            if (!is_save_shortcut) {
                return true; // Allow other keypresses to propagate
            }
            keyboard_event.preventDefault(); // Prevent default browser save action
            if (!current_document_path) {
                console.warn("No file path set, cannot save.");
                return false;
            }
            save_current_editor_content(); // Execute save operation
            return false;
        });

        /**
         * Loads a file's content into the editor.
         * @param {string} file_system_path - The path to the file. If null/undefined, opens a new untitled document.
         */
        function open_document_in_editor(file_system_path) {
            // Prompt to save if there are unsaved changes
            if (content_modified_flag && !save_current_editor_content(true)) {
                return; // Abort open if user cancels save
            }

            current_document_path = null; // Clear current path before opening new
            let editor_display_path = "Untitled"; // Default display name

            if (file_system_path) {
                const file_extension = path_resolver_util.extname(file_system_path).substring(1); // Get extension without dot
                const detected_file_mode = extension_to_mode_map[file_extension];

                if (detected_file_mode) {
                    current_editor_syntax_mode_identifier = detected_file_mode;
                    main_editor_session.setMode(`ace/mode/${detected_file_mode}`);
                } else {
                    // Fallback to text mode if no specific mode is found
                    current_editor_syntax_mode_identifier = "text";
                    main_editor_session.setMode("ace/mode/text");
                    console.warn(`No specific Ace mode found for extension: ${file_extension}. Defaulting to text mode.`);
                }

                try {
                    const file_content = file_system_util.readFileSync(file_system_path, "utf8");
                    main_editor_session.setValue(file_content);
                    editor_display_path = file_system_path;
                    content_modified_flag = false; // Reset modified flag after successful load
                    console.log(`Successfully loaded file: ${file_system_path}`);
                } catch (read_error) {
                    console.error(`Error reading file ${file_system_path}:`, read_error);
                    window.alert(`Could not open file: ${read_error.message}`);
                    main_editor_session.setValue(""); // Clear editor on error
                }
            } else {
                main_editor_session.setValue("");
                console.log("Opened a new untitled document.");
            }

            current_document_path = editor_display_path;
            document.title = current_document_path; // Update window title
            content_modified_flag = false; // Ensure flag is reset for new/empty documents
        }

        /**
         * Triggers a file save-as dialog and handles the selected path.
         * @param {string} input_element_selector - CSS selector for the hidden file input element.
         */
        function prompt_for_save_location(input_element_selector) {
            const file_input_element = document.querySelector(input_element_selector);
            if (!file_input_element) {
                console.error(`Save dialog input element not found: ${input_element_selector}`);
                return;
            }
            file_input_element.click(); // Programmatically click the hidden file input
            
            // Use a one-time event listener to handle the file selection
            const handle_file_selection = (event) => {
                const selected_save_path = event.target.value;
                if (selected_save_path) {
                    current_document_path = selected_save_path;
                    content_modified_flag = true; // Mark as modified so save_current_editor_content proceeds
                    save_current_editor_content(); // Proceed to save with the new path
                } else {
                    console.log("Save-as dialog cancelled by user.");
                }
                file_input_element.removeEventListener('change', handle_file_selection); // Clean up listener
            };
            file_input_element.addEventListener('change', handle_file_selection);
        }

        /**
         * Saves the current editor content to the associated file.
         * If no file is associated or it's an "Untitled" document, it prompts for a save location.
         * @param {boolean} is_pre_open_check - True if called before opening a new file (for confirmation).
         * @returns {boolean} True if save was successful or not needed, false if cancelled.
         */
        function save_current_editor_content(is_pre_open_check = false) {
            if (!content_modified_flag && current_document_path !== "Untitled") {
                console.log("No changes to save or untitled document not modified.");
                return true; // Nothing to save
            }

            if (is_pre_open_check) {
                const user_choice = window.confirm("You have unsaved changes. Do you want to save them before proceeding?");
                if (user_choice) {
                    // User wants to save, proceed with save logic below
                } else {
                    content_modified_flag = false; // Discard changes if user opts not to save
                    return true; // Proceed with open operation
                }
            }

            const editor_content_payload = main_editor_session.getValue();

            if (current_document_path === "Untitled" || !current_document_path) {
                console.log("Document is untitled or path is missing, prompting for save location.");
                prompt_for_save_location('#saveasDialog');
                // The actual save will happen after the dialog returns a path
                return false; // Indicate that save is pending via dialog
            } else {
                try {
                    file_system_util.writeFileSync(current_document_path, editor_content_payload, "utf8");
                    document.title = current_document_path; // Update title to reflect saved state
                    content_modified_flag = false; // Reset modified flag
                    console.log(`Content saved to: ${current_document_path}`);
                    return true; // Save successful
                } catch (write_error) {
                    console.error(`Error writing file ${current_document_path}:`, write_error);
                    window.alert(`Failed to save file: ${write_error.message}`);
                    return false; // Save failed
                }
            }
        }

        // UI Button Event Listeners
        document.getElementById("newFile").addEventListener('click', () => {
            if (content_modified_flag) {
                if (window.confirm("Any unsaved changes will be lost. Continue?")) {
                    open_document_in_editor();
                }
            } else {
                open_document_in_editor();
            }
        });

        document.getElementById("openFile").addEventListener('click', () => {
            const open_file_input = document.getElementById('openfileDialog');
            if (!open_file_input) {
                console.error("Open file dialog element not found.");
                return;
            }
            open_file_input.click(); // Trigger the hidden file input
            
            const handle_open_selection = (event) => {
                const selected_open_path = event.target.value;
                if (selected_open_path) {
                    // Open in a new window instance for better multi-document experience
                    launch_new_editor_window_for_file(selected_open_path);
                } else {
                    console.log("Open file dialog cancelled.");
                }
                open_file_input.removeEventListener('change', handle_open_selection);
            };
            open_file_input.addEventListener('change', handle_open_selection);
        });

        document.getElementById("saveFile").addEventListener('click', () => {
            save_current_editor_content();
        });

        document.getElementById("saveasFile").addEventListener('click', () => {
            prompt_for_save_location('#saveasDialog');
        });

        // --- Theme Management ---
        const dark_mode_themes_list = [
            'ambiance', 'chaos', 'clouds_midnight', 'cobalt', 'idle_fingers',
            'kr_theme', 'merbivore', 'merbivore_soft', 'mono_industrial', 'monokai',
            'pastel_on_dark', 'solarized_dark', 'tomorrow_night', 'tomorrow_night_blue',
            'tomorrow_night_bright', 'tomorrow_night_eighties', 'twilight', 'vibrant_ink'
        ];

        /**
         * Checks if a given theme name corresponds to a dark theme.
         * @param {string} theme_name - The name of the theme.
         * @returns {boolean} True if it's a dark theme, false otherwise.
         */
        const check_if_dark_theme = (theme_name) => dark_mode_themes_list.includes(theme_name);

        /**
         * Applies a specific theme to the editor and updates the UI header.
         * @param {string} theme_id - The ID of the theme (e.g., 'twilight').
         */
        const apply_editor_theme = (theme_id) => {
            primary_code_editor.setTheme("ace/theme/" + theme_id);
            const navbar_element = document.querySelector(".navbar-static-top");
            if (navbar_element) {
                if (check_if_dark_theme(theme_id)) {
                    navbar_element.classList.add("navbar-inverse");
                } else {
                    navbar_element.classList.remove("navbar-inverse");
                }
            }
        };

        // Event listeners for theme selection buttons
        document.querySelectorAll("[data-theme]").forEach(theme_button => {
            theme_button.addEventListener('click', (event) => {
                const selected_theme_id = event.currentTarget.dataset.theme;
                active_editor_theme_name = selected_theme_id;
                localStorage.setItem('ace_theme_preference', selected_theme_id); // Save preference
                apply_editor_theme(selected_theme_id); // Apply theme
                
                // Update active state in UI
                document.querySelectorAll("[data-theme]").forEach(btn => btn.parentElement.classList.remove("active"));
                event.currentTarget.parentElement.classList.add("active");
            });

            // Hover effect for theme previews
            theme_button.addEventListener('mouseenter', (event) => {
                const hover_theme_id = event.currentTarget.dataset.theme;
                apply_editor_theme(hover_theme_id);
            });
            theme_button.addEventListener('mouseleave', () => {
                // Revert to currently active theme on mouse leave
                apply_editor_theme(active_editor_theme_name);
            });
        });

        // Initialize theme on load
        document.querySelectorAll("[data-theme]").forEach(btn => btn.parentElement.classList.remove("active"));
        const initial_theme_button = document.querySelector(`[data-theme='${active_editor_theme_name}']`);
        if (initial_theme_button) {
            initial_theme_button.parentElement.classList.add("active");
        }
        apply_editor_theme(active_editor_theme_name);

        // --- Syntax Mode Management ---
        /**
         * Applies a specific syntax mode to the editor.
         * @param {string} mode_id - The ID of the syntax mode (e.g., 'javascript').
         */
        const set_editor_syntax_mode = (mode_id) => {
            main_editor_session.setMode(`ace/mode/${mode_id}`);
            current_editor_syntax_mode_identifier = mode_id;
        };

        // Event listeners for syntax mode selection buttons
        document.querySelectorAll("[data-mode]").forEach(mode_button => {
            mode_button.addEventListener('click', (event) => {
                const selected_mode_id = event.currentTarget.dataset.mode;
                set_editor_syntax_mode(selected_mode_id);
                
                // Update active state in UI
                document.querySelectorAll("[data-mode]").forEach(btn => btn.parentElement.classList.remove("active"));
                event.currentTarget.parentElement.classList.add("active");
            });

            // Hover effect for mode previews
            mode_button.addEventListener('mouseenter', (event) => {
                const hover_mode_id = event.currentTarget.dataset.mode;
                set_editor_syntax_mode(hover_mode_id);
            });
            mode_button.addEventListener('mouseleave', () => {
                // Revert to currently active mode on mouse leave
                set_editor_syntax_mode(current_editor_syntax_mode_identifier);
            });
        });

        // Initialize syntax mode on load (if a file was opened, it's set there; otherwise, default to text)
        if (!current_editor_syntax_mode_identifier) {
            set_editor_syntax_mode("text"); // Default to text mode if not already set by file extension
        }
        document.querySelectorAll("[data-mode]").forEach(btn => btn.parentElement.classList.remove("active"));
        const initial_mode_button = document.querySelector(`[data-mode='${current_editor_syntax_mode_identifier}']`);
        if (initial_mode_button) {
            initial_mode_button.parentElement.classList.add("active");
        }

        // --- Window Close Handling ---
        main_application_window.on('close', function() {
            if (content_modified_flag) {
                const confirm_discard = window.confirm("You have unsaved changes. Do you want to discard them and close the window?");
                if (!confirm_discard) {
                    return; // Prevent closing if user cancels
                }
            }
            // Close the window without further prompts
            this.close(true);
        });

        // UI button for explicitly closing the window
        document.getElementById("windowClose").addEventListener('click', () => {
            main_application_window.close();
        });
    };
}
;(function(e, t, n) {
    /* This is the main module loader IIFE.
     * It sets up a basic module system similar to CommonJS.
     * 'e' holds module definitions, 't' holds loaded modules, 'n' is initial module list.
     */
    function i(n, s) {
        // If module 'n' is already in the cache 't', return its exports.
        if (!t[n]) {
            // If module 'n' is not defined in 'e' (module definitions), handle the error.
            if (!e[n]) {
                var o = typeof require == "function" && require; // Try to get a global 'require'
                if (!s && o)
                    return o(n, !0); // If not a silent load and global 'require' exists, use it.
                if (r)
                    return r(n, !0); // If local 'require' exists, use it.
                throw new Error("Cannot find module '" + n + "'") // If all fails, throw an error.
            }
            // Create a new module object and its exports property.
            var u = t[n] = {
                exports: {}
            };
            // Execute the module's function, providing a local 'require', the module object, and its exports.
            e[n][0].call(u.exports, function(t) {
                var r = e[n][1][t];
                return i(r ? r : t) // Recursively require dependencies.
            }, u, u.exports)
        }
        return t[n].exports /* Return the loaded module's exports. */
    }

    // Initialize a local 'require' function if a global one is available.
    var r = typeof require == "function" && require;

    // Load all initial modules specified in 'n'.
    for (var s = 0; s < n.length; s++)
        i(n[s]);

    /* Finally, return the module loading function itself,
     * which can be used to load other modules later if needed.
     */
    return i
})({
    // Module 1: The main DataProjector application logic
    1: [function(require, module, exports) {
        // This module defines the DataProjector class,
        // which acts as the main controller for the application.

        var DataProjector, Info, Menu, Observer, Palette, Projector, Storage, Subject, Toolbar, Utility, dataProjector,
            __hasProp = {}.hasOwnProperty, // Utility function for checking own properties.
            __extends = function(child, parent) { // Utility function for CoffeeScript-style class inheritance.
                for (var key in parent) {
                    if (__hasProp.call(parent, key))
                        child[key] = parent[key];
                }

                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor();
                child.__super__ = parent.prototype;
                return child;
            };

        // --- Require necessary modules ---
        Subject = require('./Subject.coffee');
        Observer = require('./Observer.coffee');
        Utility = require('./Utility.coffee');
        Palette = require('./Palette.coffee');
        Storage = require('./Storage.coffee');
        Toolbar = require('./Toolbar.coffee');
        Menu = require('./Menu.coffee');
        Info = require('./Info.coffee');
        Projector = require('./Projector.coffee');

        /*
         * DataProjector Class Definition.
         * Inherits from Observer to receive notifications from other components.
         */
        DataProjector = (function(_super) {
            __extends(DataProjector, _super); // Extend the Observer class.

            // --- Prototype properties for component instances ---
            DataProjector.prototype.storage = null; // Manages data loading and saving.
            DataProjector.prototype.toolbar = null; // Controls application actions via UI buttons.
            DataProjector.prototype.menu = null; // Manages cluster visibility and selection.
            DataProjector.prototype.info = null; // Displays messages and status to the user.
            DataProjector.prototype.projector = null; // Handles the 3D visualization.
            DataProjector.prototype.palette = null; // Manages color generation.
            DataProjector.prototype.colors = null; // Array of generated colors.

            /**
             * Constructor for DataProjector.
             * Initializes all primary application components and establishes observer relationships.
             */
            function DataProjector() {
                // Initialize Storage component and attach DataProjector as an observer.
                this.storage = new Storage();
                this.storage.attach(this);
                this.storage.requestData(); // Initiate data loading.

                // Initialize Toolbar component and attach DataProjector.
                this.toolbar = new Toolbar('#toolbar');
                this.toolbar.attach(this);

                // Initialize Menu component and attach DataProjector.
                this.menu = new Menu('#menu');
                this.menu.attach(this);

                // Initialize Info component and attach DataProjector.
                this.info = new Info('#info');
                this.info.attach(this);

                // Initialize Projector component and attach DataProjector.
                this.projector = new Projector();
                this.projector.attach(this);
            }

            /**
             * The update method from the Observer interface.
             * This method is called by subjects to notify DataProjector of events.
             * It dispatches events to specific handler methods based on the subject type.
             * @param {Subject} subject - The observable object that triggered the update.
             * @param {string} type - The type of event that occurred.
             * @param {*} data - Any relevant data associated with the event.
             */
            DataProjector.prototype.update = function(subject, type, data) {
                if (subject instanceof Storage) {
                    this.onStorageEvent(type, data); // Handle Storage-specific events.
                }

                if (subject instanceof Toolbar) {
                    this.onToolbarEvent(type, data); // Handle Toolbar-specific events.
                }

                if (subject instanceof Menu) {
                    this.onMenuEvent(type, data); // Handle Menu-specific events.
                }

                if (subject instanceof Projector) {
                    return this.onProjectorEvent(type, data); // Handle Projector-specific events.
                }
            };

            /**
             * Handles events originating from the Storage component.
             * @param {string} type - The type of storage event (e.g., data ready, screenshot saved).
             * @param {*} data - Data related to the storage event.
             */
            DataProjector.prototype.onStorageEvent = function(type, data) {
                switch (type) {
                    case Storage.EVENT_DATA_READY:
                        // Display information about the loaded dataset.
                        this.info.display("Processed " + (this.storage.getPoints()) + " points.");
                        this.info.display("Found " + (this.storage.getClusters()) + " clusters.");
                        return this.initialize(); // Proceed with application initialization after data is ready.

                    case Storage.EVENT_SCREENSHOT_OK:
                        // Confirm that a screenshot has been successfully saved.
                        return this.info.display("Screenshot " + (this.storage.getSaved()) + " saved.");
                }
            };

            /**
             * Handles events originating from the Toolbar component.
             * These events typically correspond to user interactions with toolbar buttons.
             * @param {string} type - The type of toolbar event.
             * @param {*} data - Data related to the toolbar event.
             */
            DataProjector.prototype.onToolbarEvent = function(type, data) {
                var state; // A local variable to hold the toggle state for various UI elements.

                switch (type) {
                    case Toolbar.EVENT_MENU:
                        state = this.menu.toggle(); // Toggle menu visibility.
                        return this.toolbar.setMenuButtonSelected(state); // Update menu button visual state.

                    case Toolbar.EVENT_INFO:
                        state = this.info.toggle(); // Toggle info panel visibility.
                        return this.toolbar.setInfoButtonSelected(state); // Update info button visual state.

                    case Toolbar.EVENT_PERSPECTIVE:
                        this.projector.setMode(Projector.VIEW.PERSPECTIVE); // Set projector to perspective view.
                        return this.toolbar.setCameraButtonSelected(true, false, false); // Update camera buttons.

                    case Toolbar.EVENT_ORTHOGRAPHIC:
                        this.projector.setMode(Projector.VIEW.ORTHOGRAPHIC); // Set projector to orthographic view.
                        return this.toolbar.setCameraButtonSelected(false, true, false); // Update camera buttons.

                    case Toolbar.EVENT_DUAL:
                        this.projector.setMode(Projector.VIEW.DUAL); // Set projector to dual view.
                        return this.toolbar.setCameraButtonSelected(false, false, true); // Update camera buttons.

                    case Toolbar.EVENT_RESET:
                        this.projector.resetCamera(true); // Reset camera position and orientation.
                        return this.toolbar.blinkResetButton(); // Provide visual feedback for reset.

                    case Toolbar.EVENT_CLEAR:
                        this.info.clear(); // Clear messages from the info panel.
                        return this.toolbar.blinkClearButton(); // Provide visual feedback for clear.

                    case Toolbar.EVENT_BOX:
                        state = this.projector.toggleBox(); // Toggle bounding box visibility.
                        return this.toolbar.setBoxButtonSelected(state); // Update box button visual state.

                    case Toolbar.EVENT_VIEWPORT:
                        state = this.projector.toggleViewport(); // Toggle viewport border visibility.
                        return this.toolbar.setViewportButtonSelected(state); // Update viewport button visual state.

                    case Toolbar.EVENT_SELECT:
                        state = this.projector.toggleSelector(); // Toggle selection tool activation.
                        return this.toolbar.setSelectButtonSelected(state); // Update select button visual state.

                    case Toolbar.EVENT_VIEW_TOP:
                        this.projector.changeView(Utility.DIRECTION.TOP); // Change view to top-down.
                        return this.toolbar.setViewButtonSelected(true, false, false); // Update view buttons.

                    case Toolbar.EVENT_VIEW_FRONT:
                        this.projector.changeView(Utility.DIRECTION.FRONT); // Change view to front.
                        return this.toolbar.setViewButtonSelected(false, true, false); // Update view buttons.

                    case Toolbar.EVENT_VIEW_SIDE:
                        this.projector.changeView(Utility.DIRECTION.SIDE); // Change view to side.
                        return this.toolbar.setViewButtonSelected(false, false, true); // Update view buttons.

                    case Toolbar.EVENT_SPIN_LEFT:
                        this.projector.setSpin(Projector.SPIN.LEFT); // Start spinning left.
                        return this.toolbar.setSpinButtonSelected(true, false, false); // Update spin buttons.

                    case Toolbar.EVENT_SPIN_STOP:
                        this.projector.setSpin(Projector.SPIN.NONE); // Stop spinning.
                        return this.toolbar.setSpinButtonSelected(false, true, false); // Update spin buttons.

                    case Toolbar.EVENT_SPIN_RIGHT:
                        this.projector.setSpin(Projector.SPIN.RIGHT); // Start spinning right.
                        return this.toolbar.setSpinButtonSelected(false, false, true); // Update spin buttons.

                    case Toolbar.EVENT_ANIMATE:
                        state = this.projector.toggleAnimation(); // Toggle animation on/off.
                        return this.toolbar.setAnimateButtonSelected(state); // Update animate button visual state.

                    case Toolbar.EVENT_PRINT:
                        this.storage.saveImage(this.projector.getImage()); // Request to save the current projector image.
                        return this.toolbar.blinkPrintButton(); // Provide visual feedback for print action.
                }
            };

            /**
             * Handles events originating from the Menu component.
             * These events are typically related to cluster visibility or selection.
             * @param {string} type - The type of menu event.
             * @param {*} data - Data related to the menu event (e.g., cluster ID).
             */
            DataProjector.prototype.onMenuEvent = function(type, data) {
                switch (type) {
                    case Menu.EVENT_TOGGLE_ALL_ON:
                        return this.projector.setAllClustersVisible(true); // Make all clusters visible.

                    case Menu.EVENT_TOGGLE_ALL_OFF:
                        return this.projector.setAllClustersVisible(false); // Make all clusters invisible.

                    case Menu.EVENT_TOGGLE_ID:
                        return this.projector.toggleClusterVisibility(data.id); // Toggle visibility for a specific cluster.

                    case Menu.EVENT_CLUSTER_ID:
                        return this.projector.toggleClusterSelection(data.id); // Toggle selection for a specific cluster.
                }
            };

            /**
             * Handles events originating from the Projector component.
             * These events provide feedback on visualization state or user interactions within the 3D scene.
             * @param {string} type - The type of projector event.
             * @param {*} data - Data related to the projector event.
             */
            DataProjector.prototype.onProjectorEvent = function(type, data) {
                console.log("DataProjector.onProjectorEvent " + type + " : " + data); // Log the event for debugging purposes.

                switch (type) {
                    case Projector.EVENT_DATA_LOADED:
                        return console.log("DataProjector.onProjectorEvent " + type); // Confirm data has been loaded into the projector.

                    case Projector.EVENT_POINTS_SELECTED:
                        return this.info.display("Selected " + data.points + " points."); // Display the number of points selected.

                    case Projector.EVENT_CLUSTER_SELECTED:
                        if (data.id > -1) {
                            return this.info.display("Cluster " + data.id + " selected"); // Display the ID of the selected cluster.
                        } else {
                            return this.info.display("No cluster selected"); // Indicate that no cluster is currently selected.
                        }
                }
            };

            /**
             * Initializes application components that depend on data being loaded.
             * This method is called once the Storage component signals that data is ready.
             */
            DataProjector.prototype.initialize = function() {
                // Create a color palette based on the number of clusters.
                this.palette = new Palette(this.storage.getClusters());
                this.colors = this.palette.getColors(); // Retrieve the generated colors.

                // Populate the menu with cluster information and their corresponding colors.
                this.menu.create(this.storage.getClusters(), this.palette.getColors());

                // Provide the generated colors to the projector for rendering clusters.
                this.projector.setColors(this.colors);

                // Load the actual data points from storage into the projector.
                this.projector.load(this.storage);

                // Trigger an initial spin animation to start the visualization.
                return this.onToolbarEvent(Toolbar.EVENT_SPIN_RIGHT);
            };

            return DataProjector; // Return the DataProjector class constructor.

        })(Observer); // DataProjector inherits from Observer.

        // Instantiate the DataProjector to kick off the application.
        dataProjector = new DataProjector();

    }, {
        "./Info.coffee": 2,
        "./Menu.coffee": 3,
        "./Observer.coffee": 4,
        "./Palette.coffee": 5,
        "./Projector.coffee": 7,
        "./Storage.coffee": 9,
        "./Subject.coffee": 10,
        "./Toolbar.coffee": 11,
        "./Utility.coffee": 12
    }],

    // Module 2: Info Panel component
    2: [function(require, module, exports) {
        // This module defines the Info class, which is a specialized Panel
        // used for displaying messages to the user.

        var Info, Panel,
            __hasProp = {}.hasOwnProperty, // Utility for property checking.
            __extends = function(child, parent) { // Utility for class inheritance.
                for (var key in parent) {
                    if (__hasProp.call(parent, key))
                        child[key] = parent[key];
                }

                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor();
                child.__super__ = parent.prototype;
                return child;
            };

        Panel = require('./Panel.coffee'); // Depend on the base Panel class.

        /*
         * Info Class Definition.
         * Extends the generic Panel class to provide specific info display functionality.
         */
        Info = (function(_super) {
            __extends(Info, _super); // Inherit from Panel.

            /**
             * Constructor for the Info panel.
             * @param {string} id - The DOM selector ID for the Info panel element.
             */
            function Info(id) {
                Info.__super__.constructor.call(this, id); // Call the parent Panel's constructor.
            }

            /**
             * Appends a new message to the Info panel.
             * Each message is followed by a line break.
             * @param {string} message - The text message to display.
             */
            Info.prototype.display = function(message) {
                return $('#message').append(message + "<br/>"); // Use jQuery to append the message.
            };

            /**
             * Clears all messages currently displayed in the Info panel.
             */
            Info.prototype.clear = function() {
                return $('#message').text(""); // Use jQuery to clear the text content.
            };

            return Info; // Return the Info class constructor.

        })(Panel); // Info inherits from Panel.

        module.exports = Info; // Export the Info class for other modules to use.

    }, {
        "./Panel.coffee": 6
    }],

    // Module 3: Menu Panel component
    3: [function(require, module, exports) {
        // This module defines the Menu class, a specialized Panel for managing
        // cluster visibility and selection within the application.

        var Menu, Panel,
            __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            }, // Utility function for binding 'this' context to methods.
            __hasProp = {}.hasOwnProperty, // Utility for property checking.
            __extends = function(child, parent) { // Utility for class inheritance.
                for (var key in parent) {
                    if (__hasProp.call(parent, key))
                        child[key] = parent[key];
                }

                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor();
                child.__super__ = parent.prototype;
                return child;
            };

        Panel = require('./Panel.coffee'); // Depend on the base Panel class.

        /*
         * Menu Class Definition.
         * Extends the generic Panel class to manage interactive cluster controls.
         */
        Menu = (function(_super) {
            __extends(Menu, _super); // Inherit from Panel.

            // --- Menu Event Constants ---
            Menu.EVENT_TOGGLE_ALL_ON = "EVENT_TOGGLE_ALL_ON"; // Event when all clusters are turned visible.
            Menu.EVENT_TOGGLE_ALL_OFF = "EVENT_TOGGLE_ALL_OFF"; // Event when all clusters are turned invisible.
            Menu.EVENT_TOGGLE_ID = "EVENT_TOGGLE_ID"; // Event when a specific cluster's visibility is toggled.
            Menu.EVENT_CLUSTER_ID = "EVENT_CLUSTER_ID"; // Event when a specific cluster is selected.

            // --- Toggle State Display Constants ---
            Menu.TOGGLE_ON = "[+]"; // Text for "visible" state.
            Menu.TOGGLE_OFF = "[-]"; // Text for "hidden" state.
            Menu.TOGGLE_MIX = "[/]"; // Text for "mixed" state (some visible, some hidden).

            // --- Prototype Properties ---
            Menu.prototype.clusters = 0; // Total number of clusters.
            Menu.prototype.selected = -1; // ID of the currently selected cluster, -1 if none.
            Menu.prototype.colors = null; // Array of colors for each cluster.

            /**
             * Constructor for the Menu panel.
             * @param {string} id - The DOM selector ID for the Menu panel element.
             */
            function Menu(id) {
                // Bind event handler methods to the current instance of Menu.
                this.onCluster = __bind(this.onCluster, this);
                this.onToggle = __bind(this.onToggle, this);
                this.onToggleAll = __bind(this.onToggleAll, this);

                Menu.__super__.constructor.call(this, id); // Call the parent Panel's constructor.
            }

            /**
             * Handles the click event for the "Toggle All" button.
             * This button controls the visibility of all clusters at once.
             * @param {Event} event - The DOM click event object.
             */
            Menu.prototype.onToggleAll = function(event) {
                var i, state, _i, _j, _ref, _ref1;
                state = $("#toggleAll").text(); // Get the current text (state) of the master toggle.

                switch (state) {
                    case Menu.TOGGLE_OFF:
                    case Menu.TOGGLE_MIX:
                        // If all are off or mixed, turn all individual toggles ON.
                        $("#toggleAll").text(Menu.TOGGLE_ON);
                        for (i = _i = 0, _ref = this.clusters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                            $("#t" + String(i)).text(Menu.TOGGLE_ON);
                        }
                        return this.notify(Menu.EVENT_TOGGLE_ALL_ON); // Notify observers that all are ON.

                    case Menu.TOGGLE_ON:
                        // If all are ON, turn all individual toggles OFF.
                        $("#toggleAll").text(Menu.TOGGLE_OFF);
                        for (i = _j = 0, _ref1 = this.clusters; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
                            $("#t" + String(i)).text(Menu.TOGGLE_OFF);
                        }
                        return this.notify(Menu.EVENT_TOGGLE_ALL_OFF); // Notify observers that all are OFF.
                }
            };

            /**
             * Handles the click event for an individual cluster's visibility toggle button.
             * @param {Event} event - The DOM click event object.
             */
            Menu.prototype.onToggle = function(event) {
                var id, identifier, index;
                identifier = event.target.id;
                id = identifier.replace("t", ""); // Extract the cluster ID from the button's ID.
                index = parseInt(id); // Convert the ID to an integer.

                this.doToggle(index); // Perform the actual toggle action.
                return this.notify(Menu.EVENT_TOGGLE_ID, {
                    id: index
                }); // Notify observers about the specific cluster toggle.
            };

            /**
             * Handles the click event for an individual cluster's selection button.
             * @param {Event} event - The DOM click event object.
             */
            Menu.prototype.onCluster = function(event) {
                var index;
                index = parseInt(event.target.id.replace("b", "")); // Extract the cluster ID from the button's ID.

                // Toggle the selection state: if already selected, deselect; otherwise, select.
                if (this.selected === index) {
                    this.selected = -1; // Deselect.
                } else {
                    this.selected = index; // Select.
                }

                this.updateSwatches(); // Update the visual appearance of color swatches.
                this.updateButtons(); // Update the visual appearance of cluster buttons.
                return this.notify(Menu.EVENT_CLUSTER_ID, {
                    id: index
                }); // Notify observers about the cluster selection.
            };

            /**
             * Performs the core logic for toggling a single cluster's visibility.
             * @param {number} index - The ID of the cluster to toggle.
             */
            Menu.prototype.doToggle = function(index) {
                var state, tag;
                tag = "#t" + String(index); // Construct the jQuery selector for the toggle button.
                state = $(tag).text(); // Get the current text (state) of the individual toggle.

                switch (state) {
                    case Menu.TOGGLE_ON:
                        $(tag).text(Menu.TOGGLE_OFF); // Change state to OFF.
                        break;
                    case Menu.TOGGLE_OFF:
                        $(tag).text(Menu.TOGGLE_ON); // Change state to ON.
                }
                return this.updateMasterToggle(); // After changing an individual toggle, update the master "Toggle All" button.
            };

            /**
             * Dynamically creates the menu items (toggle, button, color swatch) for each cluster.
             * @param {number} clusters - The total number of clusters to create menu items for.
             * @param {Array<THREE.Color>} colors - An array of THREE.Color objects for each cluster.
             */
            Menu.prototype.create = function(clusters, colors) {
                var html, i, _i, _j, _ref, _ref1;
                this.clusters = clusters; // Store the number of clusters.
                this.colors = colors; // Store the cluster colors.

                // Loop to create and append HTML for each cluster's menu item.
                for (i = _i = 0, _ref = this.clusters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                    html = "<span class='toggle' id='t" + i + "'>[+]</span><span class='button' id='b" + i + "'> Cluster</span><span class='color' id='c" + i + "'> " + i + " </span><br/>";
                    $("#menu").append(html); // Append the generated HTML to the menu element.
                }

                // Attach event listener to the master "Toggle All" button.
                $("#toggleAll").click(this.onToggleAll);

                // Loop to attach event listeners to each individual cluster's toggle and selection buttons.
                for (i = _j = 0, _ref1 = this.clusters; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
                    $("#t" + String(i)).click(this.onToggle); // For toggling visibility.
                    $("#b" + String(i)).click(this.onCluster); // For selecting the cluster.
                }
                return this.updateSwatches(); // Perform an initial update of the color swatches.
            };

            /**
             * Counts how many individual cluster visibility toggles are currently in the ON state.
             * @returns {number} The count of clusters whose visibility toggle is ON.
             */
            Menu.prototype.togglesOn = function() {
                var i, result, state, tag, _i, _ref;
                result = 0; // Initialize the counter.
                for (i = _i = 0, _ref = this.clusters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                    tag = "#t" + String(i); // Selector for the current toggle button.
                    state = $(tag).text(); // Get its current text state.
                    if (state === Menu.TOGGLE_ON) {
                        result++; // Increment if it's ON.
                    }
                }
                return result;
            };

            /**
             * Updates the text (state) of the master "Toggle All" button
             * based on the current states of all individual cluster toggles.
             */
            Menu.prototype.updateMasterToggle = function() {
                var shown;
                shown = this.togglesOn(); // Get the count of ON toggles.

                switch (shown) {
                    case 0:
                        return $("#toggleAll").text(Menu.TOGGLE_OFF); // If zero toggles are ON, set master to OFF.
                    case this.clusters:
                        return $("#toggleAll").text(Menu.TOGGLE_ON); // If all toggles are ON, set master to ON.
                    default:
                        return $("#toggleAll").text(Menu.TOGGLE_MIX); // Otherwise, set master to MIXED.
                }
            };

            /**
             * Updates the visual color of the color swatch for each cluster.
             * The selected cluster's swatch is highlighted.
             */
            Menu.prototype.updateSwatches = function() {
                var i, _i, _ref, _results;
                _results = [];
                for (i = _i = 0, _ref = this.clusters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                    if (i === this.selected) {
                        _results.push($("#c" + String(i)).css('color', Palette.HIGHLIGHT.getStyle())); // Apply highlight color if selected.
                    } else {
                        _results.push($("#c" + String(i)).css('color', this.colors[i].getStyle())); // Apply original cluster color.
                    }
                }
                return _results;
            };

            /**
             * Updates the visual color of the selection button for each cluster.
             * The selected cluster's button is highlighted.
             */
            Menu.prototype.updateButtons = function() {
                var i, _i, _ref, _results;
                _results = [];
                for (i = _i = 0, _ref = this.clusters; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
                    if (i === this.selected) {
                        _results.push($("#b" + String(i)).css('color', Palette.HIGHLIGHT.getStyle())); // Apply highlight color if selected.
                    } else {
                        _results.push($("#b" + String(i)).css('color', Palette.BUTTON.getStyle())); // Apply default button color.
                    }
                }
                return _results;
            };

            return Menu; // Return the Menu class constructor.

        })(Panel); // Menu inherits from Panel.

        module.exports = Menu; // Export the Menu class.

    }, {
        "./Panel.coffee": 6
    }],

    // Module 4: Observer Interface
    4: [function(require, module, exports) {
        // This module defines the base Observer class, which is a key part
        // of the Observer design pattern used for inter-component communication.

        var Observer;

        /*
         * Observer Class Definition.
         * Provides a common interface for objects that wish to be notified of changes.
         */
        Observer = (function() {
            /**
             * Constructor for Observer.
             * It's an empty constructor as Observer primarily defines an interface.
             */
            function Observer() {}

            /**
             * The `update` method is the core of the Observer interface.
             * Concrete observer classes must implement this method to react to notifications.
             * @param {Subject} subject - The subject that issued the notification.
             * @param {string} type - A string indicating the type of event that occurred.
             * @param {*} data - Any relevant data payload associated with the event.
             */
            Observer.prototype.update = function(subject, type, data) {};

            return Observer; // Return the Observer class constructor.

        })();

        module.exports = Observer; // Export the Observer class.

    }, {}],

    // Module 5: Color Palette Management
    5: [function(require, module, exports) {
        // This module defines the Palette class, responsible for generating
        // and managing a set of colors used throughout the application,
        // particularly for distinguishing clusters in the visualization.

        var Palette;

        /*
         * Palette Class Definition.
         * Contains static color constants and methods for generating dynamic color sets.
         */
        Palette = (function() {
            // --- Static Color Constants ---
            Palette.BACKGROUND = new THREE.Color(0x202020); // Dark background color.
            Palette.HIGHLIGHT = new THREE.Color(0xFFFFFF); // White highlight color.
            Palette.SELECTOR = new THREE.Color(0xCC0000); // Red color for selection.
            Palette.BUTTON = new THREE.Color(0xCCCCCC); // Light gray for default button text.
            Palette.BUTTON_SELECTED = new THREE.Color(0xFF9C00); // Orange for selected button text.

            // --- Prototype Properties ---
            Palette.prototype.colors = null; // Array to store the generated THREE.Color objects.

            /**
             * Constructor for the Palette.
             * @param {number} size - The number of distinct colors to generate.
             */
            function Palette(size) {
                this.colors = new Array(); // Initialize the array to hold colors.
                this.generate(size); // Immediately generate colors upon instantiation.
            }

            /**
             * Generates a set of colors using HSL (Hue, Saturation, Lightness) values.
             * The hue is varied to create distinct colors, while saturation and lightness are kept constant.
             * @param {number} size - The number of colors to generate.
             */
            Palette.prototype.generate = function(size) {
                var color, hue, i, lightness, saturation, step, _i, _results;
                hue = 0; // Starting hue value.
                saturation = 0.7; // Constant saturation for all generated colors.
                lightness = 0.45; // Constant lightness for all generated colors.
                step = 1 / size; // Calculate the step size for hue to distribute colors evenly.

                _results = [];
                // Loop to generate 'size' number of colors.
                for (i = _i = 0; 0 <= size ? _i < size : _i > size; i = 0 <= size ? ++_i : --_i) {
                    hue = (i + 1) * step; // Increment hue for the next color.
                    color = new THREE.Color(); // Create a new THREE.Color object.
                    color.setHSL(hue, saturation, lightness); // Set the color using HSL values.
                    _results.push(this.colors.push(color)); // Add the generated color to the colors array.
                }
                return _results;
            };

            /**
             * Retrieves the array of generated THREE.Color objects.
             * @returns {Array<THREE.Color>} An array containing the generated colors.
             */
            Palette.prototype.getColors = function() {
                return this.colors;
            };

            /**
             * Prints the generated colors to the console, including their CSS style string
             * and HSL components, for debugging purposes.
             */
            Palette.prototype.print = function() {
                var c, css, hsl, hue, i, lightness, saturation, _i, _len, _ref, _results;
                i = 0; // Initialize a counter for logging.
                _ref = this.colors;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    c = _ref[_i]; // Current color object.
                    css = c.getStyle(); // Get the CSS string representation (e.g., "rgb(255,0,0)").
                    hsl = c.getHSL(); // Get the HSL components (h, s, l).
                    hue = hsl.h.toFixed(1); // Format hue to one decimal place.
                    saturation = hsl.s.toFixed(1); // Format saturation.
                    lightness = hsl.l.toFixed(1); // Format lightness.
                    _results.push(console.log(i++ + " > " + hue + " : " + saturation + " : " + lightness + " | " + css));
                }
                return _results;
            };

            return Palette; // Return the Palette class constructor.

        })();

        module.exports = Palette; // Export the Palette class.

    }, {}],

    // Module 6: Base Panel Class
    6: [function(require, module, exports) {
        // This module defines the base Panel class, which serves as a foundation
        // for all UI panels in the application (e.g., Menu, Info).
        // It extends the Subject class to allow panels to notify other components.

        var Panel, Subject,
            __hasProp = {}.hasOwnProperty, // Utility for property checking.
            __extends = function(child, parent) { // Utility for class inheritance.
                for (var key in parent) {
                    if (__hasProp.call(parent, key))
                        child[key] = parent[key];
                }

                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor();
                child.__super__ = parent.prototype;
                return child;
            };

        Subject = require('./Subject.coffee'); // Depend on the Subject class.

        /*
         * Panel Class Definition.
         * A base class for UI panels, providing basic visibility control and notification capabilities.
         */
        Panel = (function(_super) {
            __extends(Panel, _super); // Inherit from Subject.

            // --- Panel Event Constants ---
            Panel.EVENT_PANEL_SHOWN = "EVENT_PANEL_SHOWN"; // Event type for when a panel becomes visible.
            Panel.EVENT_PANEL_HIDDEN = "EVENT_PANEL_HIDDEN"; // Event type for when a panel becomes hidden.

            // --- Prototype Properties ---
            Panel.prototype.visible = true; // Initial visibility state of the panel.

            /**
             * Constructor for the Panel.
             * @param {string} id - The DOM selector ID for the panel element (e.g., "#menu", "#info").
             */
            function Panel(id) {
                this.id = id; // Store the panel's DOM ID.
                Panel.__super__.constructor.call(this); // Call the parent Subject's constructor to initialize observers.
            }

            /**
             * Makes the panel visible in the DOM and notifies any attached observers.
             */
            Panel.prototype.show = function() {
                $(this.id).show(); // Use jQuery to set the display style to make the element visible.
                this.visible = true; // Update the internal visibility state.
                return this.notify(Panel.EVENT_PANEL_SHOWN); // Notify observers of the panel being shown.
            };

            /**
             * Hides the panel in the DOM and notifies any attached observers.
             */
            Panel.prototype.hide = function() {
                $(this.id).hide(); // Use jQuery to set the display style to hide the element.
                this.visible = false; // Update the internal visibility state.
                return this.notify(Panel.EVENT_PANEL_HIDDEN); // Notify observers of the panel being hidden.
            };
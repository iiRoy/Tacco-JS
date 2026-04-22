(function() {
    const application_global_context = {
        portal_collection: [],
        current_viewport_index: 0,
        ui_components: {},
        utility_routines: {}
    };

    const produce_element = (tag_name, class_names = [], properties = {}, child_nodes = []) => {
        const component_node = document.createElement(tag_name);
        class_names.forEach(cls => component_node.classList.add(cls));
        Object.entries(properties).forEach(([key, value]) => component_node.setAttribute(key, value));
        child_nodes.forEach(child => {
            if (typeof child === 'string') {
                component_node.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                component_node.appendChild(child);
            }
        });
        return component_node;
    };

    class PortalUnit {
        constructor(initial_locator) {
            this.resource_address = initial_locator;
            this.rotation_phase_value = 0;
            this.animation_interval_id = null;

            this.indicator_element = produce_element("div", ["icon-loader", "spinner-style"]);
            this.termination_control = produce_element("div", ["icon-close", "close-button-style"]);
            this.display_caption_node = document.createTextNode(initial_locator);
            this.caption_wrapper_element = produce_element("div", ["label-text-area"], {}, [this.display_caption_node]);
            
            this.view_label_element = produce_element("li", ["portal-entry-label"], {}, [
                this.indicator_element,
                this.caption_wrapper_element,
                this.termination_control
            ]);

            this.viewport_frame_element = produce_element("iframe", ["content-render-frame"], { src: initial_locator, mozbrowser: true });

            if (!this.viewport_frame_element.mozbrowser) {
                console.log("!!!!! Embedded browser frame creation failed - ensure experimental mode is enabled (-e) !!!!!");
                window.close();
            }

            this.termination_control.addEventListener("click", (event) => {
                this.terminate_instance();
                event.stopPropagation();
            });

            this.view_label_element.addEventListener("click", () => {
                const current_active_unit = application_global_context.utility_routines.retrieve_active_portal();
                if (current_active_unit !== this) {
                    current_active_unit.deactivate_unit_display();
                    this.activate_unit_display();
                }
            });

            this.viewport_frame_element.addEventListener("mozbrowserloadstart", () => this.initiate_rotation());
            this.viewport_frame_element.addEventListener("mozbrowserloadend", () => this.halt_rotation());
            this.viewport_frame_element.addEventListener("mozbrowsertitlechange", (e) => {
                this.display_caption_node.nodeValue = e.detail;
                application_global_context.utility_routines.refresh_interface_display();
            });
            this.viewport_frame_element.addEventListener("mozbrowserlocationchange", (e) => {
                this.resource_address = e.detail;
                application_global_context.utility_routines.refresh_interface_display();
            });

            document.getElementById("content").appendChild(this.viewport_frame_element);

            this.label_node = this.view_label_element;
            this.frame_node = this.viewport_frame_element;
        }

        initiate_rotation() {
            this.halt_rotation();
            this.animation_interval_id = setInterval(() => {
                this.indicator_element.style.transform = `rotate(${this.rotation_phase_value}turn)`;
                this.rotation_phase_value += 0.015;
            }, 15);
        }

        halt_rotation() {
            if (this.animation_interval_id !== null) {
                clearInterval(this.animation_interval_id);
                this.animation_interval_id = null;
            }
        }

        terminate_instance() {
            application_global_context.utility_routines.remove_portal_instance(this);
        }

        is_active_unit() {
            return this.label_node.classList.contains("active-portal-status");
        }

        activate_unit_display() {
            this.label_node.classList.add("active-portal-status");
            this.frame_node.classList.remove("invisible-state");
            
            const current_unit_index = application_global_context.portal_collection.findIndex(unit => unit === this);
            const max_units_per_pane = application_global_context.utility_routines.determine_visible_portal_count();
            application_global_context.current_viewport_index = Math.floor(current_unit_index / max_units_per_pane);
            
            application_global_context.utility_routines.refresh_interface_display();
        }

        deactivate_unit_display() {
            this.frame_node.classList.add("invisible-state");
            this.label_node.classList.remove("active-portal-status");
        }

        conceal_label_element() {
            this.label_node.classList.add("invisible-state");
        }

        reveal_label_element() {
            this.label_node.classList.remove("invisible-state");
        }

        refresh_content_frame() {
            try {
                this.frame_node.reload();
            } catch (e) {
                console.log("Embedded frame reload not yet implemented.");
            }
        }

        navigate_forward() {
            try {
                this.frame_node.goForward();
            } catch (e) {
                console.log("Embedded frame goForward unavailable - experimental mode required (-e)");
                window.close();
            }
            application_global_context.utility_routines.refresh_interface_display();
        }

        navigate_backward() {
            try {
                this.frame_node.goBack();
            } catch (e) {
                console.log("Embedded frame goBack unavailable - experimental mode required (-e)");
                window.close();
            }
            application_global_context.utility_routines.refresh_interface_display();
        }

        load_new_destination(target_address) {
            const lower_address = target_address.toLowerCase();
            const prefixed_address = (lower_address.includes("http://") || lower_address.includes("https://"))
                ? target_address
                : `http://${target_address}`;
            this.frame_node.src = prefixed_address;
        }
    }

    application_global_context.utility_routines = {
        construct_and_append_portal: (locator) => {
            const new_portal = new PortalUnit(locator);
            application_global_context.portal_collection.push(new_portal);
            new_portal.activate_unit_display();

            const new_portal_button = document.getElementById("new-tab");
            const portal_container = document.getElementById("tab-container");
            portal_container.insertBefore(new_portal.label_node, new_portal_button);

            return new_portal;
        },

        retrieve_active_portal: () => {
            const active_unit = application_global_context.portal_collection.find(unit => unit.is_active_unit());
            if (!active_unit) {
                throw "No active portal unit found!";
            }
            return active_unit;
        },

        remove_portal_instance: (target_unit) => {
            const unit_index = application_global_context.portal_collection.findIndex(unit => unit === target_unit);
            if (unit_index === -1) {
                throw "Target portal unit for removal not found.";
            }

            const [removed_unit] = application_global_context.portal_collection.splice(unit_index, 1);
            const was_active = removed_unit.is_active_unit();
            if (was_active) {
                removed_unit.deactivate_unit_display();
            }
            removed_unit.label_node.parentNode.removeChild(removed_unit.label_node);
            removed_unit.frame_node.parentNode.removeChild(removed_unit.frame_node);

            if (application_global_context.portal_collection.length === 0) {
                window.close();
            } else if (was_active) {
                const next_active_index = Math.max(0, unit_index - 1);
                const next_active_unit = application_global_context.portal_collection[next_active_index];
                next_active_unit.activate_unit_display();
            }
            application_global_context.utility_routines.refresh_interface_display();
        },

        handle_new_portal_request: () => {
            if (application_global_context.portal_collection.length > 0) {
                application_global_context.utility_routines.retrieve_active_portal().deactivate_unit_display();
            }
            application_global_context.utility_routines.construct_and_append_portal("about:blank");
        },

        refresh_interface_display: () => {
            const currently_active_unit = application_global_context.utility_routines.retrieve_active_portal();
            application_global_context.ui_components.location_bar.value = currently_active_unit.resource_address;
            document.title = currently_active_unit.display_caption_node.nodeValue;

            const max_visible_units = application_global_context.utility_routines.determine_visible_portal_count();
            const start_index = application_global_context.current_viewport_index * max_visible_units;
            const end_index = start_index + max_visible_units;

            application_global_context.portal_collection.forEach((unit, idx) => {
                (idx < start_index || idx >= end_index) ? unit.conceal_label_element() : unit.reveal_label_element();
            });

            const previous_pane_button = application_global_context.ui_components.previous_pane_trigger;
            (application_global_context.current_viewport_index === 0)
                ? previous_pane_button.classList.add("invisible-state")
                : previous_pane_button.classList.remove("invisible-state");

            const next_pane_button = application_global_context.ui_components.next_pane_trigger;
            (end_index >= application_global_context.portal_collection.length)
                ? next_pane_button.classList.add("invisible-state")
                : next_pane_button.classList.remove("invisible-state");
        },

        determine_visible_portal_count: () => {
            const body_dimension = document.body.getBoundingClientRect().width;
            return Math.floor((body_dimension - 85) / 160);
        },

        shift_to_previous_pane: () => {
            if (application_global_context.current_viewport_index > 0) {
                application_global_context.current_viewport_index--;
                application_global_context.utility_routines.refresh_interface_display();
            }
        },

        shift_to_next_pane: () => {
            const maximum_units_per_pane = application_global_context.utility_routines.determine_visible_portal_count();
            if (application_global_context.portal_collection.length / maximum_units_per_pane > application_global_context.current_viewport_index + 1) {
                application_global_context.current_viewport_index++;
                application_global_context.utility_routines.refresh_interface_display();
            }
        },

        handle_content_refresh: () => {
            application_global_context.utility_routines.retrieve_active_portal().refresh_content_frame();
        },

        process_navigation_input: (event) => {
            if ([8, 46].includes(event.keyCode)) {
                application_global_context.ui_components.location_bar.value = "";
                event.preventDefault();
            } else if (event.keyCode === 13) {
                const active_portal = application_global_context.utility_routines.retrieve_active_portal();
                active_portal.load_new_destination(application_global_context.ui_components.location_bar.value);
            }
        },

        handle_forward_traversal: () => {
            application_global_context.utility_routines.retrieve_active_portal().navigate_forward();
        },

        handle_backward_traversal: () => {
            application_global_context.utility_routines.retrieve_active_portal().navigate_backward();
        },

        adjust_layout_on_resize: () => {
            application_global_context.utility_routines.retrieve_active_portal().activate_unit_display();
        },

        fetch_location_input: () => {
            return document.getElementById("header-url");
        },

        initialize_application: () => {
            application_global_context.ui_components.location_bar = application_global_context.utility_routines.fetch_location_input();
            application_global_context.ui_components.previous_pane_trigger = document.getElementById("tab-set-prev");
            application_global_context.ui_components.next_pane_trigger = document.getElementById("tab-set-next");

            application_global_context.utility_routines.construct_and_append_portal("about:blank");

            window.addEventListener("resize", application_global_context.utility_routines.adjust_layout_on_resize);
            
            window.requestNewPortal = application_global_context.utility_routines.handle_new_portal_request;
            window.requestReloadContent = application_global_context.utility_routines.handle_content_refresh;
            window.requestForwardNav = application_global_context.utility_routines.handle_forward_traversal;
            window.requestBackwardNav = application_global_context.utility_routines.handle_backward_traversal;
            window.processAddressInput = application_global_context.utility_routines.process_navigation_input;
            window.shiftToPriorPane = application_global_context.utility_routines.shift_to_previous_pane;
            window.shiftToNextPane = application_global_context.utility_routines.shift_to_next_pane;
        }
    };

    window.addEventListener("load", application_global_context.utility_routines.initialize_application);

})();
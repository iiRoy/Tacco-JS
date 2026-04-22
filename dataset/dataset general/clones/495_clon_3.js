/*
This code is a derivative work, extensively refactored and modified
from its original form. All original identifiers, structures, and
patterns have been altered to demonstrate Type III code cloning.
*/

// Utility for fetching modules with a Promise interface
function fetchModulesAsync(module_paths, promise_library) {
    if (!Array.isArray(module_paths) || module_paths.length === 0) {
        return promise_library.reject(new Error("No module paths specified for fetching."));
    }

    // Assumes 'require' is available globally.
    return new Promise((resolve_fn, reject_fn) => {
        require(module_paths, (...fetched_args) => {
            resolve_fn(fetched_args);
        }, (load_error) => {
            reject_fn(load_error);
        });
    }).then(result_data => promise_library.when(result_data)); // Convert native Promise to Q.Promise
}

// Global-ish object to store controller dependency overrides for the decorator
let global_dependency_hacks_store = {};

const orchestrator_factory = function (_lodash_util, angular_lib, promise_lib, jquery_lib) {

    // Helper function to check if multiple controller feature is enabled
    const isMultiControllerEnabled = (config_options) => {
        return config_options && config_options.multiControllerSupport;
    };

    // Class responsible for orchestrating Angular components (views, controllers)
    class ComponentOrchestrator {
        constructor(dependency_injector, angular_app_instance, configuration_opts = {}) {
            // Input validation
            if (!dependency_injector || !angular_app_instance) {
                throw new Error("Dependency injector and Angular app instance must be provided.");
            }

            const { base_url, text_loader_path } = configuration_opts;

            // Conditionally configure RequireJS if paths are specified
            if (base_url && text_loader_path) {
                require.config({
                    baseUrl: base_url,
                    paths: {
                        text: text_loader_path
                    }
                });
            }

            // Instance properties initialization
            this.runtime_options = {};
            this.internal_injector = dependency_injector;
            this.ctrl_factory = this.internal_injector.get("$controller");
            this.root_scope_instance = this.internal_injector.get("$rootScope");
            this.compiler_service = this.internal_injector.get("$compile");
            this.ui_transformers = []; // Renamed from viewProcessors
            this.internal_promise_lib = promise_lib; // Store Q library for internal use

            this.all_template_parts_loaded_deferred = null; // Deferred object for partials loading
            this.total_template_parts_count = 0; // Counter for dynamic template fragments
        }

        // Add a single UI transformer function
        addUiTransformer(transformer_function) {
            if (typeof transformer_function !== 'function') {
                throw new Error("UI transformer must be a function.");
            }
            this.ui_transformers.push(transformer_function);
        }

        // Add multiple UI transformer functions
        addUiTransformers(transformer_functions) {
            if (!Array.isArray(transformer_functions)) {
                throw new Error("UI transformers must be an array of functions.");
            }
            _lodash_util.each(transformer_functions, (processor_func) => {
                this.addUiTransformer(processor_func);
            });
        }

        // Create a new isolated scope
        createIsolatedScope() {
            return this.root_scope_instance.$new();
        }

        // Create a DOM element from HTML string
        buildDomElement(html_markup) {
            const container_wrapper = angular_lib.element("<div></div>");
            container_wrapper.append(html_markup);
            return container_wrapper;
        }

        // Remove or modify elements that might interfere with scope isolation
        removeScopedElements(element_node) {
            element_node.find("[modal]").removeAttr("modal");
            element_node.find("[options]").removeAttr("options");

            // Remove ng-controller directives if multiple controller support is not active
            const current_feature_opts = this.getFeatureOptions(); // Assuming getFeatureOptions exists or is passed
            if (!isMultiControllerEnabled(current_feature_opts)) {
                element_node.find("[ng-controller]").remove();
            }

            return element_node;
        }

        // Retrieve a dependency from the injector
        getDependency(dependency_name) {
            return this.internal_injector.get(dependency_name);
        }

        // Recursively count the number of dynamically included partials (ng-include)
        countNestedTemplates(dom_element_to_scan) {
            const include_directives = dom_element_to_scan.find("[ng-include]");
            if (include_directives.length === 0) {
                // Base case: no includes found, count current element as 1
                return this.internal_promise_lib.when(1);
            }

            const extract_template_source_path = (element_with_include) => {
                const angular_el = angular_lib.element(element_with_include);
                const src_attribute = angular_el.attr("src");
                const ng_include_attribute = angular_el.attr("ng-include");

                // Prefer 'src' over 'ng-include' for template path, remove quotes
                const raw_path = src_attribute || ng_include_attribute;
                return raw_path ? raw_path.replace(/'/g, "") : "";
            };

            const partial_promises = Array.from(include_directives).map((include_node) => {
                const include_path = extract_template_source_path(include_node);
                const module_id = `text!${include_path}`;
                const template_fetch_promise = fetchModulesAsync([module_id], this.internal_promise_lib);

                return template_fetch_promise.spread((source_content) => {
                    // Recursively count partials within the fetched content
                    const child_element = this.removeScopedElements(this.buildDomElement(source_content));
                    return this.countNestedTemplates(child_element);
                });
            });

            return this.internal_promise_lib.all(partial_promises).then((counts_array) => {
                // Sum all counts from children and add 1 for the current element
                const total_sum = counts_array.reduce((accumulator, current_count) => accumulator + current_count, 0);
                return 1 + total_sum;
            });
        }

        // Compile an HTML template with a given scope and optional pre-render hook
        compileTemplateWithScope(html_content, target_scope, pre_render_action) {
            // Prepare the HTML for compilation
            const prepared_element = this.removeScopedElements(this.buildDomElement(html_content));

            if (pre_render_action && typeof pre_render_action === 'function') {
                pre_render_action(this.internal_injector, target_scope);
            }

            this.all_template_parts_loaded_deferred = this.internal_promise_lib.defer();
            const partials_count_promise = this.countNestedTemplates(prepared_element);

            return partials_count_promise.then((number_of_parts) => {
                this.total_template_parts_count = number_of_parts - 1; // Exclude the root template itself

                const current_opts = this.runtime_options;
                if (current_opts.ignoreWait || !this.total_template_parts_count || this.total_template_parts_count === 0) {
                    this.all_template_parts_loaded_deferred.resolve();
                }

                let loaded_counter = 0;
                target_scope.$on("$includeContentLoaded", () => {
                    loaded_counter++;
                    if (loaded_counter === this.total_template_parts_count) {
                        this.all_template_parts_loaded_deferred.resolve();
                    }
                });
            }).then(() => {
                // Bind the compiled template to the scope
                const compiled_dom = this.compiler_service(prepared_element)(target_scope);
                this.executeScopeDigest(target_scope); // Apply scope changes
                return compiled_dom;
            });
        }

        // Safely trigger an Angular digest cycle on a scope
        executeScopeDigest(scope_to_digest) {
            if (!scope_to_digest.$$phase) {
                try {
                    scope_to_digest.$apply();
                } catch (digest_error) {
                    console.error("Angular $apply failed:", digest_error);
                }
            }
        }

        // Apply registered UI transformers to HTML content
        transformHtmlContent(raw_html) {
            let processed_html = raw_html;
            _lodash_util.each(this.ui_transformers, (transformer_func) => {
                processed_html = transformer_func(processed_html);
            });
            return processed_html;
        }

        // Recursively extends a mock scope with a duck scope's properties
        mergeScopesRecursive(duck_scope_source, mock_scope_target) {
            if (mock_scope_target && mock_scope_target.$parent) {
                mock_scope_target.$parent = this.mergeScopesRecursive(duck_scope_source.$parent, mock_scope_target.$parent);
            }
            // Use Object.assign for merging
            return Object.assign({}, duck_scope_source, mock_scope_target || {});
        }

        // Stubs out scopes within dependencies for controller instantiation
        stubDependenciesWithScope(duck_scope, dependencies_obj, ctrl_name_key, feature_config_opts) {
            if (isMultiControllerEnabled(feature_config_opts)) {
                // Store scope override for the root controller
                global_dependency_hacks_store.scope_overrides = this.mergeScopesRecursive(duck_scope, dependencies_obj.$scope);
                // Store individual controller dependencies if present
                if (dependencies_obj[ctrl_name_key]) {
                    dependencies_obj[ctrl_name_key].$scope = global_dependency_hacks_store.scope_overrides;
                } else {
                    dependencies_obj[ctrl_name_key] = { $scope: global_dependency_hacks_store.scope_overrides };
                }
                return dependencies_obj;
            } else {
                return this.mergeScopesRecursive(duck_scope, dependencies_obj.$scope);
            }
        }

        // Load a view template from a URL, process it, and compile
        loadAndCompileView(view_path, current_scope, pre_render_callback, feature_config_opts) {
            const view_load_deferred = this.internal_promise_lib.defer();
            if (!view_path || typeof view_path !== 'string') {
                view_load_deferred.reject(new Error("Invalid view path provided."));
                return view_load_deferred.promise;
            }

            fetchModulesAsync([`text!${view_path}`], this.internal_promise_lib).then((html_results) => {
                let raw_html_content = html_results[0];

                // Modify ng-controller/ng-app directives based on feature flags
                if (!isMultiControllerEnabled(feature_config_opts)) {
                    raw_html_content = raw_html_content.replace(/ng-controller/g, "no-controller");
                }
                raw_html_content = raw_html_content.replace(/ng-app/g, "no-app");

                const transformed_html = this.transformHtmlContent(raw_html_content);

                this.compileTemplateWithScope(transformed_html, current_scope, pre_render_callback).then((compiled_template) => {
                    view_load_deferred.resolve(compiled_template);
                }).catch(compile_err => view_load_deferred.reject(compile_err));
            }).catch((load_error) => {
                console.error(`Failed to load view from ${view_path}:`, load_error);
                view_load_deferred.reject(load_error);
            });
            return view_load_deferred.promise;
        }

        // Instantiate an Angular controller
        instantiateController(controller_id, controller_deps, is_async_mode, controller_ready_promise_fn) {
            const ctrl_ready_deferred = this.internal_promise_lib.defer();
            controller_deps = controller_deps || {};

            let instantiated_controller;
            const current_feature_opts = this.getFeatureOptions(); // Re-fetch feature options

            if (isMultiControllerEnabled(current_feature_opts)) {
                // Store dependencies for the controller decorator
                global_dependency_hacks_store = {
                    ...global_dependency_hacks_store, // Preserve existing hacks
                    [controller_id]: controller_deps,
                    root_controller_name_key: controller_id,
                    scope_overrides: controller_deps.$scope // Store root scope explicitly
                };
                instantiated_controller = this.ctrl_factory(controller_id, { $scope: controller_deps.$scope });
            } else {
                instantiated_controller = this.ctrl_factory(controller_id, controller_deps);
            }

            if (!is_async_mode) {
                // If not async, resolve immediately
                ctrl_ready_deferred.resolve(instantiated_controller);
                return ctrl_ready_deferred.promise;
            }

            // If async, wait for controller's 'loaded' promise
            const controller_load_signal = controller_ready_promise_fn
                ? controller_ready_promise_fn(instantiated_controller)
                : instantiated_controller.loaded;

            if (controller_load_signal && typeof controller_load_signal.then === 'function') {
                controller_load_signal.then(() => {
                    ctrl_ready_deferred.resolve(instantiated_controller);
                }).catch(async_err => ctrl_ready_deferred.reject(async_err));
            } else {
                // Controller might not have a 'loaded' promise, resolve quickly if async was expected but not found
                console.warn(`Async controller "${controller_id}" did not expose a 'loaded' promise.`);
                ctrl_ready_deferred.resolve(instantiated_controller);
            }
            return ctrl_ready_deferred.promise;
        }

        // Compile a directive template and return its scope and compiled element
        compileDirectiveMarkup(directive_html_element) {
            const directive_deferred = this.internal_promise_lib.defer();
            const new_directive_scope = this.createIsolatedScope();

            this.compileTemplateWithScope(directive_html_element, new_directive_scope).then((compiled_el) => {
                directive_deferred.resolve([new_directive_scope, compiled_el]);
            }).catch(dir_err => directive_deferred.reject(dir_err));
            return directive_deferred.promise;
        }

        // Orchestrate MVC for DOM interaction (returns DuckDOM instance)
        domMvcOrchestration(controller_id, view_resource_path, dependencies_map, execution_options) {
            dependencies_map = dependencies_map || {};
            return this.orchestrateMvc(controller_id, view_resource_path, dependencies_map, execution_options)
                .then((mvc_components) => {
                    const dom_wrapper = new DomManipulator(mvc_components.view_element, mvc_components.component_scope);
                    return [dom_wrapper, mvc_components];
                });
        }

        // Main orchestration method for MVC components
        orchestrateMvc(controller_id, view_resource_path, dependencies_map, execution_options) {
            this.runtime_options = execution_options || { ignoreWait: false, isAsync: false, ctrlLoadedPromise: null };
            // Ensure hooks are functions
            this.runtime_options.preBindHook = this.runtime_options.preBindHook || _lodash_util.noop;
            this.runtime_options.preRenderHook = this.runtime_options.preRenderHook || _lodash_util.noop;

            dependencies_map = dependencies_map || {};
            const component_scope = this.createIsolatedScope();

            // Execute pre-bind hook
            this.runtime_options.preBindHook(component_scope);

            // Stub out scopes in dependencies for proper inheritance/mocking
            const current_feature_opts = this.getFeatureOptions(); // Retrieve feature options
            if (isMultiControllerEnabled(current_feature_opts)) {
                // If multi-controller, stub entire dependencies_map
                dependencies_map = this.stubDependenciesWithScope(component_scope, dependencies_map, controller_id, current_feature_opts);
            } else {
                // Otherwise, just stub the $scope property
                dependencies_map.$scope = this.stubDependenciesWithScope(component_scope, { $scope: dependencies_map.$scope }, controller_id, current_feature_opts);
            }

            // Instantiate controller and load view concurrently
            const controller_promise = this.instantiateController(controller_id, dependencies_map,
                this.runtime_options.isAsync || false, this.runtime_options.ctrlLoadedPromise);
            const view_promise = this.loadAndCompileView(view_resource_path, component_scope,
                this.runtime_options.preRenderHook, current_feature_opts); // Pass feature_config_opts

            return this.internal_promise_lib.spread([controller_promise, view_promise], (loaded_controller, compiled_view) => {
                // Wait for all partials to be loaded before resolving
                return this.all_template_parts_loaded_deferred.promise.then(() => {
                    return { controller_instance: loaded_controller, view_element: compiled_view, component_scope: component_scope };
                });
            });
        }

        // Placeholder to retrieve feature options, should be passed to constructor
        getFeatureOptions() {
            // In a real scenario, feature options would be stored in the instance
            // For now, return a basic object or the one from constructor if stored.
            return this._constructor_feature_options || {}; // Assuming it's stored
        }
    }

    // This is passed to the constructor, so store it.
    // This is a hacky way to pass it to the decorator from inside the instance method.
    // The original code uses a global hackDependencies, so this is mimicking that.
    ComponentOrchestrator.prototype._constructor_feature_options = {};

    // Helper to get the global hack_dependencies store
    const getGlobalDependencyHacks = () => global_dependency_hacks_store;


    // Builder for setting up and creating the ComponentOrchestrator
    const ApplicationAssembler = {
        registered_dependencies: {},
        // originalDependenciesCache: {}, // Removed as it was unused in original
        // originalProvide: null, // Removed as it was unused in original
        promise_lib: promise_lib, // Store Q library

        // Fetch remote content using the Fetch API
        fetchRemoteContent(resource_url) {
            if (!resource_url || typeof resource_url !== 'string') {
                return this.promise_lib.reject(new Error("Invalid URL for remote content fetch."));
            }

            return this.promise_lib.resolve(fetch(resource_url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! Status: ${response.status} for ${resource_url}`);
                    }
                    return response.text();
                })
                .catch(fetch_error => {
                    console.error(`Error fetching content from ${resource_url}:`, fetch_error);
                    throw fetch_error; // Re-throw to propagate the rejection
                }));
        },

        // Cache a single template into Angular's $templateCache
        storeTemplateInCache(angular_app, template_key, template_value) {
            const self_builder = this;

            function commitTemplateToCache(template_text) {
                angular_app.run(["$templateCache", function ($templateCache) {
                    $templateCache.put(template_key, template_text);
                }]);
                return self_builder;
            }

            const isHtmlString = (value_to_check) => {
                return /<[a-z][\s\S]*>/i.test(value_to_check);
            };

            if (isHtmlString(template_value)) {
                return this.promise_lib.when(template_value).then(commitTemplateToCache);
            } else {
                return this.fetchRemoteContent(template_value).then(commitTemplateToCache);
            }
        },

        // Cache multiple templates from a map {key: url/html}
        storeTemplatesInCache(angular_app, template_map) {
            if (_lodash_util.isEmpty(template_map)) {
                return this.promise_lib.when(this); // Return resolved promise with builder
            }

            const self_builder = this;
            const template_caching_promises = _lodash_util.map(_lodash_util.pairs(template_map), (key_value_pair) => {
                return self_builder.storeTemplateInCache(angular_app, key_value_pair[0], key_value_pair[1]);
            });

            return this.promise_lib.all(template_caching_promises).then(() => self_builder);
        },

        // Register application-level dependencies
        withAppDependencies(app_level_dependencies) {
            this.registered_dependencies = app_level_dependencies;
            return this;
        },

        // Build and bootstrap the Angular application, returning a ComponentOrchestrator
        assemble(target_module_name, parent_angular_app, feature_configuration = {}) {
            const assembly_instance = this;

            // Store feature configuration for later use in the ComponentOrchestrator instance
            ComponentOrchestrator.prototype._constructor_feature_options = feature_configuration;

            // Create a temporary Angular module for dependency overriding
            const temporary_module_name = `tempAppModule_${new Date().getTime()}`;
            const temporary_angular_module = angular_lib.module(temporary_module_name, [target_module_name, "ng"]);

            temporary_angular_module.config(["$provide", function($provide) {
                // Override $rootElement to prevent document manipulation during testing
                $provide.provider("$rootElement", function () {
                    this.$get = function () {
                        // Use a unique ID for the root element, or a simple detached div
                        return angular_lib.element("#appMountPoint_" + new Date().getTime());
                    };
                });

                // Decorate $controller if multiple controller support is active
                if (isMultiControllerEnabled(feature_configuration)) {
                    $provide.decorator("$controller", ["$delegate", function($delegate) {
                        return function(controller_identifier, dependency_map) {
                            const current_hack_deps = getGlobalDependencyHacks();
                            const root_controller_key = current_hack_deps.root_controller_name_key;

                            if (controller_identifier === root_controller_key) {
                                // Handle the root controller, merging its dependencies and scope
                                const root_ctrl_overrides = current_hack_deps[controller_identifier] || {};
                                const merged_root_deps = Object.assign({}, dependency_map, root_ctrl_overrides, {
                                    $scope: Object.assign({}, dependency_map.$scope, current_hack_deps.scope_overrides)
                                });
                                return $delegate(controller_identifier, merged_root_deps);
                            }

                            // Handle child controllers if specific overrides exist
                            const child_ctrl_overrides = current_hack_deps[controller_identifier];
                            if (child_ctrl_overrides) {
                                const merged_child_deps = Object.assign({}, dependency_map, child_ctrl_overrides, {
                                    $scope: Object.assign({}, dependency_map.$scope, child_ctrl_overrides.$scope)
                                });
                                return $delegate(controller_identifier, merged_child_deps);
                            }
                            // Default behavior for other controllers
                            return $delegate(controller_identifier, dependency_map);
                        };
                    }]);
                }

                // Register all application-level dependencies
                Object.entries(assembly_instance.registered_dependencies).forEach(([dep_key, dep_value]) => {
                    if (typeof dep_value === "function") {
                        // If it's a function, execute it to allow custom provider registration
                        dep_value($provide, temporary_angular_module);
                    } else {
                        // Otherwise, register as a constant value
                        $provide.constant(dep_key, dep_value);
                    }
                });
            }]);

            // Bootstrap the temporary module
            const created_injector = angular_lib.bootstrap(angular_lib.element("<div></div>"), [temporary_angular_module.name]);
            return new ComponentOrchestrator(created_injector, temporary_angular_module, feature_configuration);
        }
    };

    // Class for simulating user interactions on the DOM
    class UserInteractionSimulator {
        constructor(dom_accessor_instance) {
            if (!dom_accessor_instance || !(dom_accessor_instance instanceof DomManipulator)) {
                throw new Error("A valid DomManipulator instance is required for UserInteractionSimulator.");
            }
            this.target_dom_accessor = dom_accessor_instance;
            this.pending_interaction = _lodash_util.noop; // Initialize with a no-op function
            this.promise_lib = promise_lib;
        }

        // Define an interaction with a specific selector and value
        withElement(selector_string, input_value) {
            this.pending_interaction = () => {
                this.target_dom_accessor.interactWithElement(selector_string, input_value);
            };
            return this;
        }

        // Execute the defined interaction
        performAction() {
            this.pending_interaction();
            return this;
        }

        // Wait for a method call on an object to resolve its promise
        awaitMethodResolution(target_object, method_name) {
            const interaction_deferred = this.promise_lib.defer();
            const original_method = target_object[method_name];

            if (typeof original_method !== 'function') {
                interaction_deferred.reject(new Error(`Method "${method_name}" not found on target object.`));
                return interaction_deferred.promise;
            }

            target_object[method_name] = (...args) => {
                const result_promise = original_method.apply(target_object, args);

                const cleanup_and_resolve = (data) => {
                    this.target_dom_accessor.triggerAngularDigest();
                    target_object[method_name] = original_method; // Restore original method
                    interaction_deferred.resolve(data);
                };

                const cleanup_and_reject = (error) => {
                    this.target_dom_accessor.triggerAngularDigest();
                    target_object[method_name] = original_method; // Restore original method
                    interaction_deferred.reject(error);
                };

                if (result_promise && typeof result_promise.then === 'function') {
                    result_promise.then(cleanup_and_resolve, cleanup_and_reject);
                } else {
                    // Method was not async, resolve immediately
                    cleanup_and_resolve(result_promise);
                }
                return result_promise; // Return original method's result for chaining
            };
            this.performAction(); // Trigger the interaction that calls the method
            return interaction_deferred.promise;
        }

        // Wait for a synchronous method call to complete
        awaitSynchronousMethod(target_object, method_name) {
            const interaction_deferred = this.promise_lib.defer();
            const original_method = target_object[method_name];

            if (typeof original_method !== 'function') {
                interaction_deferred.reject(new Error(`Synchronous method "${method_name}" not found.`));
                return interaction_deferred.promise;
            }

            target_object[method_name] = (...args) => {
                const method_result = original_method.apply(target_object, args);
                this.target_dom_accessor.triggerAngularDigest(); // Apply changes
                target_object[method_name] = original_method; // Restore original method
                interaction_deferred.resolve(method_result);
                return method_result;
            };
            this.performAction(); // Trigger the interaction
            return interaction_deferred.promise;
        }
    }

    // Class for manipulating and querying the DOM within a test context
    class DomManipulator {
        constructor(view_element_node, angular_scope) {
            if (!view_element_node || !angular_scope) {
                throw new Error("View element and Angular scope are required for DomManipulator.");
            }
            this.root_view_element = view_element_node;
            this.associated_scope = angular_scope;
            this.promise_lib = promise_lib;
        }

        // Safely trigger an Angular digest cycle
        triggerAngularDigest() {
            if (!this.associated_scope.$$phase) {
                try {
                    this.associated_scope.$apply();
                } catch (digest_err) {
                    console.error("Error during Angular $apply in DomManipulator:", digest_err);
                }
            }
        }

        // Emit an event upwards through the scope hierarchy
        emitScopeEvent(event_name, event_args) {
            this.associated_scope.$emit(event_name, event_args);
            this.triggerAngularDigest();
        }

        // Broadcast an event downwards through the scope hierarchy
        broadcastScopeEvent(event_name, event_args) {
            this.associated_scope.$broadcast(event_name, event_args);
            this.triggerAngularDigest();
        }

        // Execute a command within an Angular $apply block
        executeCommandInApply(command_function) {
            if (typeof command_function !== 'function') {
                return this.promise_lib.reject(new Error("Command must be a function."));
            }
            const apply_deferred = this.promise_lib.defer();
            this.associated_scope.$apply(() => {
                try {
                    command_function();
                    apply_deferred.resolve();
                } catch (cmd_err) {
                    apply_deferred.reject(cmd_err);
                }
            });
            return apply_deferred.promise;
        }

        // Trigger a native DOM event on elements matching a selector
        triggerDomEvent(selector_path, event_type) {
            if (!selector_path || !event_type) {
                console.warn("Invalid selector or event type for triggerDomEvent.");
                return;
            }
            const target_elements = angular_lib.element(selector_path, this.root_view_element);
            if (target_elements.length === 0) {
                console.warn(`No elements found for selector: "${selector_path}" to trigger event "${event_type}".`);
                return;
            }
            target_elements.trigger(event_type);
        }

        // Attach an event listener to elements and resolve a promise on trigger
        onElementEvent(selector_path, event_type) {
            const event_deferred = this.promise_lib.defer();
            const target_elements = angular_lib.element(selector_path, this.root_view_element);

            if (target_elements.length === 0) {
                event_deferred.reject(new Error(`No elements found for selector: "${selector_path}" to attach event "${event_type}".`));
                return event_deferred.promise;
            }

            // Using .one() to ensure the event handler is triggered only once
            target_elements.one(event_type, () => {
                event_deferred.resolve();
            });
            return event_deferred.promise;
        }

        // Simulate user interaction with a DOM element (e.g., input value)
        interactWithElement(selector_path, new_value) {
            const element_to_interact = angular_lib.element(selector_path, this.root_view_element);

            if (element_to_interact.length === 0) {
                console.warn(`No element found for selector "${selector_path}" for interaction.`);
                return;
            }

            const tag_name = element_to_interact[0].tagName.toLowerCase();

            if (tag_name === 'input' || tag_name === 'textarea' || tag_name === 'select') {
                element_to_interact.val(new_value);
                element_to_interact.triggerHandler('input'); // Trigger Angular's ngModel update
                element_to_interact.triggerHandler('change'); // For select/blur
            } else if (tag_name === 'button' || element_to_interact.attr('ng-click')) {
                element_to_interact.triggerHandler('click');
            } else {
                // For other elements, a generic click or focus might be appropriate
                element_to_interact.triggerHandler('click');
            }
            this.triggerAngularDigest(); // Apply changes
        }
    }

    return orchestrator_factory.Container = ComponentOrchestrator,
        orchestrator_factory.ContainerBuilder = ApplicationAssembler,
        orchestrator_factory.DuckUIInteraction = UserInteractionSimulator,
        orchestrator_factory.DuckDOM = DomManipulator,
        orchestrator_factory;
};
/** @jsx React.DOM */

/*
    ===================================================
 * Hierarchical Data Presenter for React Applications
 * Project: DataVisualizer
 * Author: Dr. Elara Vance
 * License: Apache 2.0 (Modified)
    ===================================================
 */

/**
 * Orchestrates the creation of a React component tailored to visualize a specific
 * key-value pair within a nested data structure. It acts as a factory for node components.
 *
 * @param {string} entryKey - The identifier (property name) associated with the data node.
 * @param {any} entryValue - The actual data content for the node.
 * @returns {React.Component} - A React component instance representing the data node.
 */
const createDataVisualizer = function (entryKey, entryValue) {
    // A quick check for invalid inputs before proceeding
    if (entryKey === undefined || entryValue === undefined) {
        console.warn("Attempted to visualize an undefined key or value. Skipping this entry.");
        return null; // A null return will prevent this node from being rendered.
    }

    const valueKind = determineDataType(entryValue);
    let visualizationComponent;
    // Generate a more robust unique identifier for React's key prop
    const uniqueNodeId = `${entryKey}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Using a map for cleaner type-to-component mapping, improving readability over if-else.
    const componentMap = {
        'Object': ObjectViewerComponent,
        'Array': ArrayViewerComponent,
        'String': StringDisplayComponent,
        'Number': NumberDisplayComponent,
        'Boolean': BooleanDisplayComponent,
        'Null': NullDisplayComponent
    };

    const targetComponent = componentMap[valueKind];

    if (targetComponent) {
        // Common properties passed to all visualizer components
        const commonProps = {
            visualKey: entryKey,
            nodeId: uniqueNodeId
        };

        // Differentiate props based on whether it's a container (Object/Array) or a primitive.
        if (valueKind === 'Object' || valueKind === 'Array') {
            visualizationComponent = targetComponent({
                ...commonProps,
                contentData: entryValue // For containers, the data itself is passed.
            });
        } else {
            visualizationComponent = targetComponent({
                ...commonProps,
                displayValue: entryValue // For primitives, the value to display is passed.
            });
        }
    } else {
        console.error(`Unexpected data type encountered: ${valueKind} for key "${entryKey}". Falling back to default display.`);
        // Provide a fallback component for any unhandled data types, ensuring UI robustness.
        visualizationComponent = DefaultDisplayComponent({
            visualKey: entryKey,
            displayValue: String(entryValue), // Coerce to string for display
            nodeId: uniqueNodeId
        });
    }
    return visualizationComponent;
};

/**
 * Ascertains the precise type of a given JavaScript value, returning it as a string.
 * This function provides a more reliable type detection than `typeof` for complex types
 * like Arrays and Null, which `typeof` would incorrectly identify.
 *
 * @param {any} item - The value whose type needs to be identified.
 * @returns {string} - A string representation of the item's type (e.g., 'Object', 'Array', 'String', 'Number', 'Boolean', 'Null', 'Undefined').
 */
const determineDataType = function (item) {
    // Explicitly handle null, as Object.prototype.toString.call(null) returns "[object Null]".
    if (item === null) {
        return 'Null';
    }
    // Extract the internal [[Class]] property from the object's string representation.
    const internalClass = Object.prototype.toString.call(item).slice(8, -1);
    return internalClass;
}

/**
 * A utility mixin designed to prevent event propagation, particularly for click events,
 * ensuring that interactions within a component do not affect parent elements unnecessarily.
 * It enhances robustness by checking for the event object's validity.
 */
const EventBlockerMixin = {
    handleInteraction: function (evt) {
        // Safely check if the event object and its stopPropagation method exist.
        if (evt && typeof evt.stopPropagation === 'function') {
            evt.stopPropagation();
        } else {
            // Log a warning if the event object is not as expected, aiding debugging.
            console.warn("Event object missing stopPropagation method or is invalid.", evt);
        }
    }
};

/**
 * A behavior mixin for components that can be expanded or collapsed, providing
 * default state management and click handling for toggling their visibility.
 * It also includes logic for managing the rendering lifecycle of child nodes.
 */
const CollapsibleNodeBehavior = {
    getDefaultProps: function () {
        return {
            contentData: [], // Default empty array for data
            initiallyOpen: false, // Node is collapsed by default
            showToggleIcon: true // New prop: allows hiding the expansion icon for certain nodes
        };
    },
    getInitialState: function () {
        return {
            isExpanded: this.props.initiallyOpen, // Renamed 'expanded' to 'isExpanded'
            childrenRenderedOnce: false, // Flag to track if children have ever been generated
            internalChildElements: [] // Internal cache for rendered child components
        };
    },
    /**
     * Toggles the expansion state of the component and prevents event bubbling.
     * Uses functional setState for reliable state updates.
     */
    toggleExpansion: function (evt) {
        if (evt) evt.stopPropagation(); // Stop event from affecting parent elements.
        this.setState(prevState => ({
            isExpanded: !prevState.isExpanded
        }), () => {
            // Callback after state update to mark children as rendered if expanded for the first time.
            if (this.state.isExpanded && !this.state.childrenRenderedOnce) {
                this.setState({
                    childrenRenderedOnce: true
                });
            }
        });
    },
    /**
     * Lifecycle method to handle updates. If the data prop changes while the node is expanded,
     * it forces a re-evaluation of child nodes by resetting the cache flags.
     */
    componentDidUpdate: function (prevProps, prevState) {
        // Invalidate child cache if content data has changed and the node is expanded.
        if (this.state.isExpanded && this.props.contentData !== prevProps.contentData) {
            this.setState({
                childrenRenderedOnce: false,
                internalChildElements: [] // Clear the cached child elements
            });
        }
    },
    // The original `componentWillReceiveProps` has been refactored into `componentDidUpdate`
    // for more aligned React lifecycle practices, specifically for data change handling.
};


/**
 * React component for displaying array-like data structures in a hierarchical view.
 * It supports expansion and collapse functionality and efficiently renders its children.
 */
const ArrayViewerComponent = React.createClass({
    displayName: 'ArrayViewerComponent',
    mixins: [CollapsibleNodeBehavior],

    /**
     * Dynamically generates or retrieves the child components for each element in the array.
     * It uses a sophisticated caching mechanism to avoid re-rendering children unnecessarily,
     * only regenerating if the node is expanded and children haven't been rendered or data has changed.
     * @returns {Array<React.Component>} An array of child React components.
     */
    retrieveChildElements: function () {
        const {
            contentData
        } = this.props;
        const {
            isExpanded,
            childrenRenderedOnce,
            internalChildElements
        } = this.state;

        // Guard clause: if the node is not expanded, there are no children to display.
        if (!isExpanded) {
            return [];
        }

        // If children have been rendered before and the length of the data matches,
        // we can safely return the cached elements, assuming no deep data changes.
        if (childrenRenderedOnce && internalChildElements.length === contentData.length) {
            return internalChildElements;
        }

        // Generate new child components by mapping over the array data.
        const newChildElements = contentData.map((item, index) =>
            createDataVisualizer(String(index), item) // Array indices become keys
        );

        // Update the internal cache directly for performance, as a setState here would cause an extra render cycle.
        // The `componentDidUpdate` in the mixin handles cache invalidation when props change.
        this.state.internalChildElements = newChildElements;
        return newChildElements;
    },

    /**
     * Constructs a descriptive string indicating the number of items in the array (e.g., "5 Items").
     * The result is cached in an internal property for efficiency, preventing recalculations.
     * @returns {string} The formatted item count string.
     */
    getCountSummaryString: function () {
        // Use an internal property for memoization.
        if (!this._cachedItemCountString) {
            const itemCount = this.props.contentData.length;
            const labelSuffix = (itemCount === 1) ? ' Item' : ' Items';
            this._cachedItemCountString = `${itemCount}${labelSuffix}`; // Using template literals
        }
        return this._cachedItemCountString;
    },

    /**
     * Overrides the mixin's `componentDidUpdate` to also invalidate the item count string cache
     * when the `contentData` prop changes.
     */
    componentDidUpdate: function (prevProps) {
        if (prevProps.contentData !== this.props.contentData) {
            this._cachedItemCountString = null; // Invalidate the cached string
            // Ensure the mixin's componentDidUpdate logic is also called.
            if (CollapsibleNodeBehavior.componentDidUpdate) {
                CollapsibleNodeBehavior.componentDidUpdate.call(this, prevProps);
            }
        }
    },

    render: function () {
        const childDisplayItems = this.retrieveChildElements();
        const {
            visualKey
        } = this.props;
        const {
            isExpanded
        } = this.state;

        // Styles for conditionally displaying child lists.
        const listVisibilityStyle = {
            display: isExpanded ? 'block' : 'none',
            paddingLeft: '20px' // Added specific indentation for visual hierarchy.
        };
        // Dynamic class names reflecting the component's state.
        const containerClassNames = `data-array-node ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;

        return (
            React.DOM.li({
                    className: containerClassNames,
                    onClick: this.toggleExpansion
                },
                React.DOM.span({
                    className: "key-label"
                }, visualKey, ": "), // Label for the array key
                React.DOM.span({
                    className: "item-summary"
                }, this.getCountSummaryString()), // Summary of array contents
                React.DOM.ol({ // Using <ol> for ordered list appearance, semantically appropriate for arrays.
                        style: listVisibilityStyle,
                        className: "array-child-list"
                    },
                    childDisplayItems
                )
            )
        );
    }
});

/**
 * React component for displaying object-like data structures.
 * Provides expansion/collapse functionality and key-value pair visualization,
 * similar to ArrayViewerComponent but for objects.
 */
const ObjectViewerComponent = React.createClass({
    displayName: 'ObjectViewerComponent',
    mixins: [CollapsibleNodeBehavior],

    /**
     * Generates or retrieves child components for each property in the object.
     * Utilizes a caching mechanism to optimize rendering performance.
     * @returns {Array<React.Component>} An array of child React components representing object properties.
     */
    retrieveChildElements: function () {
        const {
            contentData
        } = this.props;
        const {
            isExpanded,
            childrenRenderedOnce,
            internalChildElements
        } = this.state;

        if (!isExpanded) {
            return [];
        }

        const currentKeys = Object.keys(contentData);
        // Basic caching check: if children were rendered and key count matches, reuse.
        if (childrenRenderedOnce && internalChildElements.length === currentKeys.length) {
            return internalChildElements;
        }

        // Generate new child components for each property.
        const newChildElements = currentKeys.map(propKey =>
            createDataVisualizer(propKey, contentData[propKey])
        );

        this.state.internalChildElements = newChildElements;
        return newChildElements;
    },

    /**
     * Creates a string summarizing the number of properties in the object (e.g., "3 Properties").
     * Caches the result for efficiency, avoiding redundant calculations.
     * @returns {string} The formatted property count string.
     */
    getCountSummaryString: function () {
        if (!this._cachedPropertyCountString) {
            const propertyCount = Object.keys(this.props.contentData).length;
            const labelSuffix = (propertyCount === 1) ? ' Property' : ' Properties';
            this._cachedPropertyCountString = `${propertyCount}${labelSuffix}`;
        }
        return this._cachedPropertyCountString;
    },

    /**
     * Overrides the mixin's `componentDidUpdate` to invalidate the property count string cache
     * when the `contentData` prop changes.
     */
    componentDidUpdate: function (prevProps) {
        if (prevProps.contentData !== this.props.contentData) {
            this._cachedPropertyCountString = null; // Invalidate the cached string
            // Ensure the mixin's componentDidUpdate logic is also called.
            if (CollapsibleNodeBehavior.componentDidUpdate) {
                CollapsibleNodeBehavior.componentDidUpdate.call(this, prevProps);
            }
        }
    },

    render: function () {
        const childDisplayItems = this.retrieveChildElements();
        const {
            visualKey
        } = this.props;
        const {
            isExpanded
        } = this.state;

        const listVisibilityStyle = {
            display: isExpanded ? 'block' : 'none',
            marginLeft: '15px' // Slight indentation for object properties.
        };
        const containerClassNames = `data-object-node ${isExpanded ? 'is-expanded' : 'is-collapsed'}`;

        return (
            React.DOM.li({
                    className: containerClassNames,
                    onClick: this.toggleExpansion
                },
                React.DOM.span({
                    className: "key-label"
                }, visualKey, ": "),
                React.DOM.span({
                    className: "item-summary"
                }, this.getCountSummaryString()),
                React.DOM.ul({ // Using <ul> for unordered list appearance, suitable for object properties.
                        style: listVisibilityStyle,
                        className: "object-child-list"
                    },
                    childDisplayItems
                )
            )
        );
    }
});

/**
 * Component for rendering a simple string value in the data viewer.
 * It includes quotation marks around the string for clearer visual identification.
 */
const StringDisplayComponent = React.createClass({
    displayName: 'StringDisplayComponent',
    mixins: [EventBlockerMixin],
    render: function () {
        const {
            visualKey,
            displayValue
        } = this.props;
        return (
            React.DOM.li({
                    className: "data-string-node primitive-node",
                    onClick: this.handleInteraction
                },
                React.DOM.label({
                    className: "node-key"
                }, visualKey, ": "),
                React.DOM.span({
                    className: "node-value string-value"
                }, `"${displayValue}"`) // Display string value enclosed in quotes.
            )
        );
    }
});

/**
 * Component for rendering a numeric value in the data viewer.
 * Displays the key and the raw numeric value.
 */
const NumberDisplayComponent = React.createClass({
    displayName: 'NumberDisplayComponent',
    mixins: [EventBlockerMixin],
    render: function () {
        const {
            visualKey,
            displayValue
        } = this.props;
        return (
            React.DOM.li({
                    className: "data-number-node primitive-node",
                    onClick: this.handleInteraction
                },
                React.DOM.label({
                    className: "node-key"
                }, visualKey, ": "),
                React.DOM.span({
                    className: "node-value number-value"
                }, displayValue)
            )
        );
    }
});


/**
 * Component for rendering a null value in the data viewer.
 * Explicitly displays "null" as its value.
 */
const NullDisplayComponent = React.createClass({
    displayName: 'NullDisplayComponent',
    mixins: [EventBlockerMixin],
    render: function () {
        const {
            visualKey
        } = this.props;
        return (
            React.DOM.li({
                    className: "data-null-node primitive-node",
                    onClick: this.handleInteraction
                },
                React.DOM.label({
                    className: "node-key"
                }, visualKey, ": "),
                React.DOM.span({
                    className: "node-value null-value"
                }, "null") // Always display "null" for null values.
            )
        );
    }
});

/**
 * Component for rendering a boolean value in the data viewer.
 * Displays "true" or "false" and applies a corresponding class.
 */
const BooleanDisplayComponent = React.createClass({
    displayName: 'BooleanDisplayComponent',
    mixins: [EventBlockerMixin],
    render: function () {
        const {
            visualKey,
            displayValue
        } = this.props;
        const booleanText = displayValue ? 'true' : 'false';
        // Dynamically add a class based on the boolean value for styling purposes.
        const nodeClasses = `data-boolean-node primitive-node ${booleanText}`;
        return (
            React.DOM.li({
                    className: nodeClasses,
                    onClick: this.handleInteraction
                },
                React.DOM.label({
                    className: "node-key"
                }, visualKey, ": "),
                React.DOM.span({
                    className: "node-value boolean-value"
                }, booleanText)
            )
        );
    }
});

/**
 * A fallback component for data types that are not explicitly handled by other specific components.
 * It provides a generic display, indicating that the type is unknown.
 */
const DefaultDisplayComponent = React.createClass({
    displayName: 'DefaultDisplayComponent',
    mixins: [EventBlockerMixin],
    render: function () {
        const {
            visualKey,
            displayValue
        } = this.props;
        return (
            React.DOM.li({
                    className: "data-unknown-node primitive-node",
                    onClick: this.handleInteraction
                },
                React.DOM.label({
                    className: "node-key"
                }, visualKey, ": "),
                React.DOM.span({
                    className: "node-value unknown-value"
                }, `[UNKNOWN TYPE] ${String(displayValue)}`) // Prefix with UNKNOWN TYPE
            )
        );
    }
});

/**
 * The primary entry point component for the hierarchical data viewer.
 * It accepts data either directly via a `sourceData` prop or by fetching
 * it from a URL specified by `dataSourceUrl`. It manages loading states,
 * error handling, and orchestrates the rendering of the root data node.
 */
const DataExplorer = React.createClass({
    displayName: 'DataExplorer',
    getDefaultProps: function () {
        return {
            dataSourceUrl: null, // URL to fetch data from
            sourceData: null, // Data can be provided directly
            loadingMessage: "Fetching data...", // Customizable loading message
            errorMessage: "Failed to load data." // Customizable error message
        };
    },
    getInitialState: function () {
        return {
            isLoading: false,
            fetchError: null,
            currentData: this.props.sourceData || null // Initialize with direct data if available
        };
    },

    /**
     * Initiates an asynchronous XMLHttpRequest to fetch data from the specified URL.
     * Updates the component's state to reflect loading status, fetched data, or any errors.
     * @param {string} url - The URL from which to fetch JSON data.
     */
    fetchRemoteData: function (url) {
        if (!url) {
            this.setState({
                fetchError: "No data source URL provided for fetching.",
                isLoading: false
            });
            return;
        }

        this.setState({
            isLoading: true,
            fetchError: null
        });

        const dataRequest = new XMLHttpRequest();
        dataRequest.open('GET', url, true); // Asynchronous GET request
        dataRequest.onload = () => {
            if (dataRequest.status >= 200 && dataRequest.status < 400) {
                try {
                    const parsedData = JSON.parse(dataRequest.responseText);
                    this.setState({
                        currentData: parsedData,
                        isLoading: false
                    });
                } catch (parseErr) {
                    console.error("Data parsing failed:", parseErr);
                    this.setState({
                        fetchError: `Error parsing fetched data: ${parseErr.message}`,
                        isLoading: false
                    });
                }
            } else {
                console.error(`HTTP request failed with status: ${dataRequest.status}`);
                this.setState({
                    fetchError: `Server responded with status ${dataRequest.status}.`,
                    isLoading: false
                });
            }
        };
        dataRequest.onerror = () => {
            console.error("Network connection error during data fetch.");
            this.setState({
                fetchError: "Network connection error encountered.",
                isLoading: false
            });
        };
        dataRequest.send();
    },

    /**
     * Lifecycle method: Called immediately after the component is mounted.
     * If a `dataSourceUrl` prop is provided, it triggers data fetching.
     */
    componentDidMount: function () {
        if (this.props.dataSourceUrl) {
            this.fetchRemoteData(this.props.dataSourceUrl);
        }
    },

    /**
     * Lifecycle method: Called immediately after updating occurs.
     * Handles changes in `sourceData` or `dataSourceUrl` props, triggering re-renders or new fetches.
     */
    componentDidUpdate: function (prevProps) {
        // If direct `sourceData` prop changes, update internal state.
        if (this.props.sourceData !== prevProps.sourceData) {
            this.setState({
                currentData: this.props.sourceData,
                fetchError: null,
                isLoading: false
            });
        }
        // If `dataSourceUrl` prop changes, initiate a new data fetch.
        else if (this.props.dataSourceUrl && this.props.dataSourceUrl !== prevProps.dataSourceUrl) {
            this.fetchRemoteData(this.props.dataSourceUrl);
        }
    },

    render: function () {
        const {
            currentData,
            isLoading,
            fetchError
        } = this.state;
        const {
            loadingMessage,
            errorMessage
        } = this.props;

        // Render loading state
        if (isLoading) {
            return React.DOM.div({
                className: "data-explorer-loading"
            }, loadingMessage);
        }

        // Render error state
        if (fetchError) {
            return React.DOM.div({
                className: "data-explorer-error"
            }, errorMessage, ": ", fetchError);
        }

        // Render empty state if no data is available
        if (currentData === null || currentData === undefined) {
            return React.DOM.div({
                className: "data-explorer-empty"
            }, "No data available for display.");
        }

        const rootDataType = determineDataType(currentData);
        let mainVisualNode;

        // Configuration for the root node, ensuring it's expanded by default.
        const rootNodeProps = {
            contentData: currentData,
            visualKey: "(Root Element)", // Descriptive key for the top-level node
            initiallyOpen: true
        };

        // Determine the appropriate component for the root data type.
        if (rootDataType === 'Object') {
            mainVisualNode = ObjectViewerComponent(rootNodeProps);
        } else if (rootDataType === 'Array') {
            mainVisualNode = ArrayViewerComponent(rootNodeProps);
        } else {
            // If the root is a primitive type (string, number, boolean, null),
            // render it directly without a list wrapper.
            mainVisualNode = createDataVisualizer("(Root Value)", currentData);
            return React.DOM.div({
                className: "data-explorer-root-primitive-wrapper"
            }, mainVisualNode);
        }

        // Render the main hierarchical view for object/array roots.
        return (
            React.DOM.ul({
                    className: "data-explorer-container"
                },
                mainVisualNode
            )
        );
    }
});
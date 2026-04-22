let TracingService;

/**
 * @class FallbackTracer
 * @description A no-operation (stub) implementation for the tracing service
 *              when native bindings are unavailable or not loaded.
 */
class FallbackTracer {
    constructor(serviceIdentifier, contextScope) {
        this._serviceIdentifier = serviceIdentifier || 'default-tracer';
        this._contextScope = contextScope;
        this._registeredHooks = new Map();
        this._isActivated = false;
        // console.debug(`[Tracing] FallbackTracer created for '${this._serviceIdentifier}'`);
    }

    /**
     * Registers a new event hook within this tracer instance.
     * @param {string} eventName - The unique name for the event hook.
     * @returns {object} A stub event handler with a 'dispatch' method.
     */
    registerHook(eventName) {
        const hookHandler = {
            _hookName: eventName,
            dispatch: function(...args) {
                // This is a no-op, simulating an event trigger without actual tracing.
                // console.debug(`[Tracing] Fallback hook '${eventName}' dispatched with args:`, args);
            }
        };
        this[eventName] = hookHandler; // Maintain similar access pattern to original.
        this._registeredHooks.set(eventName, hookHandler);
        return hookHandler;
    }

    /**
     * Activates the tracing service (no-op for the stub).
     */
    activate() {
        this._isActivated = true;
        // console.debug(`[Tracing] FallbackTracer '${this._serviceIdentifier}' activated.`);
    }

    /**
     * Emits a tracing event (no-op for the stub).
     * @param {string} eventName - The name of the event to emit.
     * @param {...any} eventPayload - Arguments representing the event's payload.
     */
    emit(eventName, ...eventPayload) {
        if (!this._isActivated) {
            // console.warn(`[Tracing] Attempted to emit event '${eventName}' on deactivated FallbackTracer.`);
            return;
        }
        const handler = this._registeredHooks.get(eventName);
        if (handler && handler.dispatch) {
            handler.dispatch(...eventPayload); // Simulate calling the registered hook.
        }
    }

    /**
     * Deactivates the tracing service (no-op for the stub).
     */
    deactivate() {
        this._isActivated = false;
        // console.debug(`[Tracing] FallbackTracer '${this._serviceIdentifier}' deactivated.`);
    }
}

// Array containing potential build configurations for native modules.
const bindingConfigurationPaths = ['Release', 'default', 'Debug'];

let nativeModuleSuccessfullyLoaded = false;
const currentPlatform = process.platform;

// Pre-check for platforms where DTrace is definitively not supported to avoid unnecessary `require` calls.
const incompatiblePlatforms = ['win32', 'android', 'aix', 'cygwin', 'ios'];
if (incompatiblePlatforms.includes(currentPlatform) && !process.env.FORCE_DTRACE_BINDINGS_LOAD) {
    // console.info(`[Tracing] Skipping native binding load on incompatible platform: '${currentPlatform}'.`);
    nativeModuleSuccessfullyLoaded = false;
} else {
    // Iterate through known build variants to find and load the native DTrace provider.
    for (const configKey of bindingConfigurationPaths) {
        try {
            const dynamicBindingPath = `./build/${configKey}/NativeTracingModule`;
            const loadedBinding = require(dynamicBindingPath);
            TracingService = loadedBinding.TracingProvider; // Assign the actual provider from the native module.
            nativeModuleSuccessfullyLoaded = true;
            break; // Stop on the first successful load.
        } catch (bindingLoadError) {
            // Log errors only for platforms that are expected to have DTrace capabilities.
            const dtraceCapableOS = ['darwin', 'solaris', 'freebsd', 'illumos'];
            if (dtraceCapableOS.includes(currentPlatform)) {
                if (!process.env.SUPPRESS_DTRACE_BINDING_WARNINGS) {
                    console.warn(
                        `[Tracing] Warning: Failed to load native tracing bindings for variant ` +
                        `'${configKey}' on '${currentPlatform}'. Error: ${bindingLoadError.message}`
                    );
                    // console.error(bindingLoadError); // Optionally log full stack trace.
                }
            }
            // For other platforms, failure to load native bindings is often expected and not critical.
        }
    }
}

/**
 * Helper function to provide the fallback tracer.
 * @returns {FallbackTracer} The FallbackTracer class constructor.
 */
const provideFallbackImplementation = () => {
    // console.info('[Tracing] Native tracing provider not found or failed to load. Using FallbackTracer.');
    return FallbackTracer;
};

// Final assignment: use the loaded native service or fall back to the stub.
TracingService = nativeModuleSuccessfullyLoaded ? TracingService : provideFallbackImplementation();

// Export the primary tracing service constructor.
module.exports.TracingService = TracingService;

/**
 * Factory method to instantiate a new tracing service provider.
 * @param {string} identifier - A unique identifier for the tracing service instance.
 * @param {string} [contextIdentifier] - An optional context string for the service.
 * @returns {TracingService} A new instance of the selected TracingService.
 */
module.exports.getTracerInstance = function(identifier, contextIdentifier) {
    // Basic input validation for the identifier.
    if (typeof identifier !== 'string' || identifier.trim().length === 0) {
        console.error('[Tracing] Error: Tracer instance identifier must be a non-empty string.');
        identifier = 'anonymous-tracer'; // Default to a fallback identifier.
    }

    const TracerConstructor = module.exports.TracingService;
    const argumentCount = arguments.length;

    // Instantiate the tracer based on the number of provided arguments.
    const newTracerInstance = (argumentCount === 2)
        ? new TracerConstructor(identifier, contextIdentifier)
        : new TracerConstructor(identifier);

    // Optional: Automatically activate the tracer upon creation.
    // if (typeof newTracerInstance.activate === 'function') {
    //     newTracerInstance.activate();
    // }

    return newTracerInstance;
};
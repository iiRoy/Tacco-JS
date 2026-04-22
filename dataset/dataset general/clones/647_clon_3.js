/*
 * CoreJS Runtime Integration Utility
 *
 * This module facilitates the dynamic loading and management of CoreJS-based
 * components within a Narwhal-compatible module environment.
 *
 * It was initially developed by a dedicated team of engineers
 * and has undergone several revisions since its inception in 2007.
 * All rights reserved by the original creators and maintainers.
 *
 * This software is distributed under the terms of the GNU General Public License,
 * Version 3, or any later version at your discretion.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * For full license details, refer to the accompanying LICENSE file or
 * visit https://www.gnu.org/licenses/gpl-3.0.html
 */

function createModuleSystemLoader() {
    const componentRegistry = new Map(); // Stores module generators
    const runtimeInterface = Object.create(null); // The public interface of this loader

    // Helper to ensure CoreJS is loaded
    const ensureCoreJSRuntime = () => {
        if (!global.CoreJS) {
            try {
                console.log("Attempting to load 'core-js-runtime' globally...");
                global.CoreJS = require("core-js-runtime");
                if (!global.CoreJS) {
                    throw new Error("Required 'core-js-runtime' is null or undefined after loading.");
                }
                console.info("CoreJS runtime successfully initialized.");
            } catch (loadError) {
                console.error("Critical error: Failed to load CoreJS runtime module.", loadError.message);
                // Propagate the error or handle it gracefully based on system requirements
                throw new Error("CoreJS runtime dependency missing or corrupted.");
            }
        }
        return global.CoreJS;
    };

    /**
     * Refreshes or initially registers a module generator for a given key and source path.
     * @param {string} moduleIdentifier - A unique key for the module.
     * @param {string} moduleSourcePath - The filesystem path to the module source.
     * @returns {boolean} True if the registration was successful, false otherwise.
     */
    runtimeInterface.refreshModuleGenerator = function(moduleIdentifier, moduleSourcePath) {
        if (typeof moduleIdentifier !== 'string' || !moduleIdentifier.trim()) {
            console.error("Invalid module identifier provided for refresh operation.");
            return false;
        }
        if (typeof moduleSourcePath !== 'string' || !moduleSourcePath.trim()) {
            console.error(`Invalid source path for module '${moduleIdentifier}'.`);
            return false;
        }

        try {
            const corejs = ensureCoreJSRuntime();
            // Generate a new module provider using the CoreJS runtime
            const newModuleProvider = corejs.buildComponentProvider(moduleSourcePath);
            newModuleProvider.sourceLocation = moduleSourcePath; // Attach original path for debugging/metadata

            componentRegistry.set(moduleIdentifier, newModuleProvider);
            console.debug(`Module generator for '${moduleIdentifier}' refreshed from '${moduleSourcePath}'.`);
            return true;
        } catch (opError) {
            console.error(`Failed to refresh module generator for '${moduleIdentifier}':`, opError.message);
            return false;
        }
    };

    /**
     * Retrieves an existing module generator from the registry, or attempts to refresh it if not found.
     * @param {string} moduleIdentifier - The unique key of the module.
     * @param {string} fallbackSourcePath - The path to use if the module needs to be refreshed.
     * @returns {object|null} The module generator object, or null if retrieval fails.
     */
    runtimeInterface.getOrCreateModuleGenerator = function(moduleIdentifier, fallbackSourcePath) {
        if (typeof moduleIdentifier !== 'string' || !moduleIdentifier.trim()) {
            console.error("A valid module identifier string is required for retrieval.");
            return null;
        }

        // Check if the component is already cached
        if (componentRegistry.has(moduleIdentifier)) {
            console.debug(`Returning cached module generator for '${moduleIdentifier}'.`);
            return componentRegistry.get(moduleIdentifier);
        }

        // If not found, attempt to refresh it
        console.log(`Module generator for '${moduleIdentifier}' not found, attempting to refresh...`);
        const refreshSuccess = runtimeInterface.refreshModuleGenerator(moduleIdentifier, fallbackSourcePath);

        if (refreshSuccess) {
            return componentRegistry.get(moduleIdentifier);
        } else {
            console.warn(`Could not retrieve or register module generator for '${moduleIdentifier}'.`);
            return null;
        }
    };

    // Seal the public interface to prevent external modifications
    return Object.freeze(runtimeInterface);
}

// Integrate this loader into the Narwhal-like module system's file handlers.
// The system expects an array of objects, where each object defines an extension and its factory.
if (typeof require !== 'undefined' && require.loader && Array.isArray(require.loader.loaders)) {
    require.loader.loaders.unshift({
        fileExtension: ".oj", // Custom extension for Objective-J like files
        handlerFactory: createModuleSystemLoader // Provide the factory function
    });
    console.info("Custom '.oj' module loader registered with the system.");
} else {
    console.error("Failed to register custom module loader: 'require.loader.loaders' not found or is not an array.");
}
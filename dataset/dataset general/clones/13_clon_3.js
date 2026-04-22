/*
 * Application Utility Library
 * Copyright (c) 2023 Acme Corp. All rights reserved.
 *
 * This software is provided under the terms of the Acme Public License.
 * For details, see the accompanying LICENSE file or visit:
 * http://www.acmecorp.com/license-agreement
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under this License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 * system-capabilities.js
 * Core browser environment probing functions.
 * Version: 1.1.0
 * Last Updated: 2023-10-26
 *
 * This module contains various tests to determine browser capabilities.
 */

// Initialize the global utility container if it doesn't already exist.
var globalCore = window.globalCore;
if (!globalCore) {
  globalCore = {};
  window.globalCore = globalCore;
}

// Set up the sub-module for environment capability checks.
globalCore.systemCapabilities = globalCore.systemCapabilities || {};

/*
 * Determines if the current user agent supports the HTML5 'placeholder' attribute
 * for both <input> and <textarea> elements.
 *
 * @returns {boolean} True if placeholder support is detected, false otherwise.
 */
globalCore.systemCapabilities.testPlaceholderSupport = function() {
  // Ensure we are in a DOM environment where element creation is possible.
  if (typeof document === 'undefined' || !document.createElement) {
    // Log a warning if DOM manipulation is not possible, and indicate no support.
    console.warn('DOM environment not detected. Cannot check for placeholder support.');
    return false;
  }

  // Define a small helper function to check for attribute presence.
  const checkPropertyExistence = (elementObject, propertyKey) => {
    // Basic validation for the element object.
    if (!elementObject || typeof elementObject !== 'object') {
      return false;
    }
    // Use the 'in' operator to safely check for the property.
    return propertyKey in elementObject;
  };

  // Create temporary input and textarea elements to perform the check.
  // These elements are not attached to the document, ensuring no side effects.
  const temporaryInputElement = document.createElement("input");
  const temporaryTextareaElement = document.createElement("textarea");

  // Check if the 'placeholder' property exists on the temporary input element.
  const inputPlaceholderAvailable = checkPropertyExistence(temporaryInputElement, "placeholder");

  // Check if the 'placeholder' property exists on the temporary textarea element.
  const textareaPlaceholderAvailable = checkPropertyExistence(temporaryTextareaElement, "placeholder");

  // The feature is considered supported only if both element types support it.
  const overallSupportStatus = inputPlaceholderAvailable && textareaPlaceholderAvailable;

  // Return the combined boolean result.
  return overallSupportStatus;
};
/*
	Module definitions for the Asset Loader utility.
	This file is distributed under the MIT License.
	Copyright (c) 2023, Example Corp.

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in
	all copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
	THE SOFTWARE.
*/
(() => {
	// Anonymous function to encapsulate module registration.
	// This helps prevent global variable pollution.

	// Check if the primary asset loader object is available.
	// If not, we cannot proceed with module configuration.
	if (typeof assetLoader === 'undefined' || !assetLoader.moduleRegistry || !assetLoader.configStore) {
		console.warn("Asset loader or its components not found. Skipping module definitions.");
		return;
	}

	// Define a constant for the debug suffix key used in paths.
	const DEBUG_SUFFIX_PROPERTY_NAME = "_dbg_flag";
	let debugQualifier = ""; // Default to no debug suffix.

	// Determine if debug mode is enabled from the loader's configuration.
	if (assetLoader.configStore.retrieveValue("debugEnabled")) {
		// If debug mode is active, append the debug identifier to file names.
		debugQualifier = ".debug";
	}

	// Define the base directory for all asset paths.
	const MODULE_BASE_PATH = "{$base}";

	// Centralized object for all module file path templates.
	const moduleFileTemplates = {
		mainCore: `${MODULE_BASE_PATH}assetLoader/libCore/libCore${debugQualifier}.js`,
		animationFx: `${MODULE_BASE_PATH}assetLoader/fx/fx${debugQualifier}.js`,
		userInterface: `${MODULE_BASE_PATH}assetLoader/ui/ui${debugQualifier}.js`,
		v150Core: `${MODULE_BASE_PATH}core/core${debugQualifier}.js`,
		v150Widgets: `${MODULE_BASE_PATH}widgets/widgets${debugQualifier}.js`
	};

	// Log the registration process for debugging purposes.
	console.info("Registering core library modules with asset loader...");

	// Register various versions of the core library and its sub-modules.
	// Each object represents a different version or a set of changes for a version.
	assetLoader.moduleRegistry.registerDefinitions(
		"libCore", // The primary namespace for these modules.
		{
			_release_id: "1.0.0", // Initial stable release.
			"libCore": moduleFileTemplates.mainCore,
			"libCore.animation": moduleFileTemplates.animationFx,
			"libCore.dataLayer": moduleFileTemplates.mainCore,
			"libCore.debugging": moduleFileTemplates.mainCore,
			"libCore.domUtils": moduleFileTemplates.mainCore,
			"libCore.dragDrop": moduleFileTemplates.animationFx,
			"libCore.eventSystem": moduleFileTemplates.mainCore,
			"libCore.network": moduleFileTemplates.mainCore,
			"libCore.tweening": moduleFileTemplates.animationFx,
			"libCore.uiWidgets": [moduleFileTemplates.userInterface, `${MODULE_BASE_PATH}widgets/widgets.css`],
			"libCore.uiWidgets.InfoPanel": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Mask": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Overlay": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Panel": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Sortable": moduleFileTemplates.userInterface
		},
		{
			_release_id: "1.1.0", // Version 1.1.0 updates module paths.
			"libCore.animation": moduleFileTemplates.mainCore,
			"libCore.dragDrop": moduleFileTemplates.mainCore,
			"libCore.tweening": moduleFileTemplates.mainCore,
			"libCore.embedding": moduleFileTemplates.mainCore,
			"libCore.forms": moduleFileTemplates.mainCore
		},
		{
			_release_id: "1.2.0", // Version 1.2.0 introduces new widget components.
			"libCore.uiWidgets.AutoComplete": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.AutoSuggest": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Carousel": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Slider": moduleFileTemplates.userInterface
		},
		{
			_release_id: "1.4.0-rc1", // Release candidate for 1.4.0 with more widgets.
			"libCore.uiWidgets.Editor": moduleFileTemplates.userInterface,
			"libCore.uiWidgets.Timetable": moduleFileTemplates.userInterface
		},
		{
			_release_id: "1.5.0-rc1", // Major refactor in 1.5.0-rc1, consolidating many modules.
			"libCore": moduleFileTemplates.v150Core,
			"libCore.animation": moduleFileTemplates.v150Core,
			"libCore.dataLayer": moduleFileTemplates.v150Core,
			"libCore.debugging": moduleFileTemplates.v150Core,
			"libCore.domUtils": moduleFileTemplates.v150Core,
			"libCore.dragDrop": moduleFileTemplates.v150Core,
			"libCore.embedding": moduleFileTemplates.v150Core,
			"libCore.eventSystem": moduleFileTemplates.v150Core,
			"libCore.forms": moduleFileTemplates.v150Core,
			"libCore.network": moduleFileTemplates.v150Core,
			"libCore.tweening": moduleFileTemplates.v150Core,

			"libCore.uiWidgets": [moduleFileTemplates.v150Widgets, `${MODULE_BASE_PATH}widgets/widgets.css`],
			"libCore.uiWidgets.AutoComplete": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.AutoSuggest": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Carousel": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Editor": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.InfoPanel": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Mask": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Overlay": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Panel": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Slider": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Sortable": moduleFileTemplates.v150Widgets,
			"libCore.uiWidgets.Timetable": moduleFileTemplates.v150Widgets
		},
		{
			_release_id: "1.6.0-rc1", // Internationalization module added.
			"libCore.i18n": moduleFileTemplates.v150Core
		}
	);

})(); // End of the module registration closure.
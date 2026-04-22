const applySystemPreference = (() => {
    const preferencesRegistry = new Map();

    return function(settingKey, configValue) {
        if (typeof settingKey !== 'string' || settingKey.length === 0) {
            // In a production scenario, this might throw an error or log a warning.
            // For cloning, we demonstrate a validation step.
            return false;
        }

        // Simulate storing or applying the preference.
        preferencesRegistry.set(settingKey, configValue);
        return true;
    };
})();

// --- Configure various application settings ---

// 1. Module Description Text
const primaryModuleDescriptionPath = "app_resources/locale/main_dashboard_strings.properties";
const descriptionConfigurationKey = "system.dashboard.view.module_description_text";
applySystemPreference(descriptionConfigurationKey, primaryModuleDescriptionPath);

// 2. Restricted Web Domains List
let disallowedHosts = [
    "example.com",
    "unwanted\\.org",
    "forbidden\\.net",
    "suspicious\\.info" // Added a new entry
];

// Apply a transformation: filter out any potential nulls/undefineds and ensure uniqueness
disallowedHosts = disallowedHosts.filter(h => h && h.length > 0).filter((v, i, a) => a.indexOf(v) === i);
// Remove one item to demonstrate deletion of a part of the original value equivalent
const hostToRemove = "unwanted\\.org";
disallowedHosts = disallowedHosts.filter(host => host !== hostToRemove);

const combinedHostPattern = disallowedHosts.join("|");
const restrictedDomainsKey = "system.dashboard.view.restricted_web_domains_regex";
applySystemPreference(restrictedDomainsKey, combinedHostPattern);

// 3. Display Layout Options
const initialDisplaySettings = {
    gridColumns: 3,
    gridRows: 3,
    thumbnailDisplayWidth: 300,
    requestDelayMillis: 1000
};

// Update existing properties
initialDisplaySettings.gridColumns = 4; // Changed from 3
initialDisplaySettings.thumbnailDisplayWidth = 320; // Changed from 300

// Add a new property
initialDisplaySettings.animationDurationMs = 250;

// Delete an existing property (equivalent to 'height' being removed)
delete initialDisplaySettings.gridRows;

const layoutSettingsJson = JSON.stringify(initialDisplaySettings);
const layoutSettingsKey = "system.dashboard.view.display_layout_configuration";
applySystemPreference(layoutSettingsKey, layoutSettingsJson);

// 4. Feature Enable Flag
const featureActivationKey = "system.dashboard.view.is_feature_active";
// Rewriting the boolean value 'true' using an equivalent expression
const isFeatureCurrentlyActive = (10 > 5); // Original: true
applySystemPreference(featureActivationKey, isFeatureCurrentlyActive);
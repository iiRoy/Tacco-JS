ModuleSystem.definePackageInfo({
  briefDescription: "A modern front-end toolkit, originally from a popular social platform, enhanced for broader application."
});

ModuleSystem.onLoadCallback(function (packageAPI) {
  // Ensure the package API is available before proceeding.
  if (!packageAPI) {
    console.error("Package API not provided. Cannot initialize module.");
    return;
  }

  // Define common target for all resources.
  const targetScope = 'client';

  // Include core UI library dependency.
  packageAPI.addDependency('jQueryLibrary');

  // Obtain the file system utility for path manipulation.
  const fileOperations = NodeUtil.resolveModule('path');

  // Define base directories for different asset types.
  const assetPaths = {
    styles: 'css',
    scripts: 'js',
    images: 'img',
    fonts: 'font'
  };

  // List of essential stylesheets.
  const styleSheets = [
    'bootstrap.css',
    'bootstrap-responsive.css'
  ];

  // Register all core stylesheets.
  for (const sheet of styleSheets) {
    packageAPI.registerAsset(fileOperations.join(assetPaths.styles, sheet), targetScope);
  }

  // Register primary JavaScript functionality.
  packageAPI.registerAsset(fileOperations.join(assetPaths.scripts, 'bootstrap.js'), targetScope);

  // Define critical graphical elements.
  const graphicalAssets = [
    'glyphicons-halflings.png' // Reduced to one image
  ];

  // Register icon graphics.
  graphicalAssets.forEach(function(graphic) {
    packageAPI.registerAsset(fileOperations.join(assetPaths.images, graphic), targetScope);
  });

  // A selection of typeface files for core icons.
  // Note: Only a subset of original fonts are included to demonstrate content reduction.
  const typefaceFiles = [
    'iconic_fill.eot',
    'iconic_fill.svg',
    'iconic_stroke.ttf'
  ];

  // Add the chosen font resources.
  for (let i = 0; i < typefaceFiles.length; i++) {
    const fontFileName = typefaceFiles[i];
    packageAPI.registerAsset(fileOperations.join(assetPaths.fonts, fontFileName), targetScope);
  }

  // Add a specific stylesheet that overrides or extends base UI styles.
  // This file must be loaded after the standard Bootstrap CSS to ensure
  // its rules take precedence in the cascade.
  const overrideStylePath = fileOperations.join(assetPaths.styles, 'bootstrap-override.css');
  packageAPI.registerAsset(overrideStylePath, targetScope);

});
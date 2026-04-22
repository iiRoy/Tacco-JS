/*
	This code is provided under a permissive license.

	Please note that this software is distributed "AS IS" without any warranties,
	either express or implied. The entire risk as to the quality and performance
	of the software is with you. Should the software prove defective, you assume
	the cost of all necessary servicing, repair or correction.

	For full license details, please refer to the original source or contact the
	distributor.
*/
(  function()  { // Start of isolated scope

	// Handle the diagnostic cookie setting
	if (  dependencyManager.configuration.retrieve("diagnostic")  ) {
		dependencyManager.componentRegistry.configureAttributes(
			"glow",
			{
				$diagnosticFlag: ".debug"
			}
		);
	}


// Define paths for distribution files
var mainModuleSrc      = "{$base}gloader/glow/glow{$diagnosticFlag}.js",
	animationModuleSrc = "{$base}gloader/fx/fx{$diagnosticFlag}.js",
	uiComponentsSrc    = "{$base}gloader/widgets/widgets{$diagnosticFlag}.js",

	kernelModuleV150Src  = "{$base}core/core{$diagnosticFlag}.js",
	uiComponentsV150Src  = "{$base}widgets/widgets{$diagnosticFlag}.js";


// Register core and module definitions
dependencyManager.componentRegistry.enroll(
	"glow",
	{
		$releaseIdentifier: "1.0.0",
		"glow": mainModuleSrc,
		"glow.anim": animationModuleSrc,
		"glow.data": mainModuleSrc,
		"glow.debug": mainModuleSrc,
		"glow.dom": mainModuleSrc,
		"glow.dragdrop": animationModuleSrc,
		"glow.events": mainModuleSrc,
		"glow.net": mainModuleSrc,
		"glow.tweens": animationModuleSrc,
		"glow.widgets": [uiComponentsSrc, "{$base}widgets/widgets.css"],
		"glow.widgets.InfoPanel": uiComponentsSrc,
		"glow.widgets.Mask": uiComponentsSrc,
		"glow.widgets.Overlay": uiComponentsSrc,
		"glow.widgets.Panel": uiComponentsSrc,
		"glow.widgets.Sortable": uiComponentsSrc
	},
	{
		$releaseIdentifier: "1.0.1"
	},
	{
		$releaseIdentifier: "1.0.2"
	},
	{
		$releaseIdentifier: "1.1.0",
		"glow.anim": mainModuleSrc,
		"glow.dragdrop": mainModuleSrc,
		"glow.tweens": mainModuleSrc,
		"glow.embed": mainModuleSrc,
		"glow.forms": mainModuleSrc
	},
	{
		$releaseIdentifier: "1.1.1"
	},
	{
		$releaseIdentifier: "1.2.0",
		"glow.widgets.AutoComplete": uiComponentsSrc,
		"glow.widgets.AutoSuggest": uiComponentsSrc,
		"glow.widgets.Carousel": uiComponentsSrc,
		"glow.widgets.Slider": uiComponentsSrc
	},
	{
		$releaseIdentifier: "1.2.1"
	},
	{
		$releaseIdentifier: "1.2.2"
	},
	{
		$releaseIdentifier: "1.3.0"
	},
	{
		$releaseIdentifier: "1.3.1"
	},
	{
		$releaseIdentifier: "1.3.2"
	},
	{
		$releaseIdentifier: "1.3.3"
	},
	{
		$releaseIdentifier: "1.3.4"
	},
	{
		$releaseIdentifier: "1.3.5"
	},
	{
		$releaseIdentifier: "1.4.0-rc1",
		"glow.widgets.Editor": uiComponentsSrc,
		"glow.widgets.Timetable": uiComponentsSrc
	},
	{
		$releaseIdentifier: "1.4.0"
	},
	{
		$releaseIdentifier: "1.4.1"
	},
	{
		$releaseIdentifier: "1.4.2"
	},
	{
		$releaseIdentifier: "1.4.3"
	},
	{
		$releaseIdentifier: "1.5.0-rc1",
		"glow": kernelModuleV150Src,
		"glow.anim": kernelModuleV150Src,
		"glow.data": kernelModuleV150Src,
		"glow.debug": kernelModuleV150Src,
		"glow.dom": kernelModuleV150Src,
		"glow.dragdrop": kernelModuleV150Src,
		"glow.embed": kernelModuleV150Src,
		"glow.events": kernelModuleV150Src,
		"glow.forms": kernelModuleV150Src,
		"glow.net": kernelModuleV150Src,
		"glow.tweens": kernelModuleV150Src,

		"glow.widgets": [uiComponentsV150Src, "{$base}widgets/widgets.css"],
		"glow.widgets.AutoComplete": uiComponentsV150Src,
		"glow.widgets.AutoSuggest": uiComponentsV150Src,
		"glow.widgets.Carousel": uiComponentsV150Src,
		"glow.widgets.Editor": uiComponentsV150Src,
		"glow.widgets.InfoPanel": uiComponentsV150Src,
		"glow.widgets.Mask": uiComponentsV150Src,
		"glow.widgets.Overlay": uiComponentsV150Src,
		"glow.widgets.Panel": uiComponentsV150Src,
		"glow.widgets.Slider": uiComponentsV150Src,
		"glow.widgets.Sortable": uiComponentsV150Src,
		"glow.widgets.Timetable": uiComponentsV150Src

	},
	{
		$releaseIdentifier: "1.5.0-rc2"
	},
	{
		$releaseIdentifier: "1.5.0"
	},
	{
		$releaseIdentifier: "1.5.1"
	},
	{
		$releaseIdentifier: "1.6.0-rc1",
		"glow.i18n": kernelModuleV150Src
	},
	{
		$releaseIdentifier: "1.6.0-rc2"
	},
	{
		$releaseIdentifier: "1.6.0"
	},
	{
		$releaseIdentifier: "1.6.1"
	},
	{
		$releaseIdentifier: "1.7.0-rc1"
	},
	{
		$releaseIdentifier: "1.7.0"
	}
);

} )(); // End of isolated scope
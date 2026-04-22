//
// Copyright 2009 British Broadcasting Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

( function ( ) { // This is the start of the main closure.

	// A quick implementation for glow's internal magic debug cookie.
	if ( gloader . settings . get ( "debug" ) )
	{
		gloader . map . setProperties (
			"glow",
			{
				$debug : ".debug"
			}
		) ;
	}


	// Define paths for various distributed JavaScript files.

	var glow_js = "{$base}gloader/glow/glow{$debug}.js" ;
	var effects_js = "{$base}gloader/fx/fx{$debug}.js" ;
	var widgets_js = "{$base}gloader/widgets/widgets{$debug}.js" ;

	var core_150_js = "{$base}core/core{$debug}.js" ;
	var widgets_150_js = "{$base}widgets/widgets{$debug}.js" ;


	// Configure the glow map with various versions and their associated files.
	gloader . map . add (
		"glow",
		{
			$version : "1.0.0",
			"glow" : glow_js,
			"glow.anim" : effects_js,
			"glow.data" : glow_js,
			"glow.debug" : glow_js,
			"glow.dom" : glow_js,
			"glow.dragdrop" : effects_js,
			"glow.events" : glow_js,
			"glow.net" : glow_js,
			"glow.tweens" : effects_js,
			"glow.widgets" : [widgets_js, "{$base}widgets/widgets.css"],
			"glow.widgets.InfoPanel" : widgets_js,
			"glow.widgets.Mask" : widgets_js,
			"glow.widgets.Overlay" : widgets_js,
			"glow.widgets.Panel" : widgets_js,
			"glow.widgets.Sortable" : widgets_js
		},
		{
			$version : "1.0.1"
		},
		{
			$version : "1.0.2"
		},
		{
			// Version 1.1.0 introduces some changes to module mappings.
			$version : "1.1.0",
			"glow.anim" : glow_js,
			"glow.dragdrop" : glow_js,
			"glow.tweens" : glow_js,
			"glow.embed" : glow_js,
			"glow.forms" : glow_js
		},
		{
			$version : "1.1.1"
		},
		{
			// Version 1.2.0 adds new widget components.
			$version : "1.2.0",
			"glow.widgets.AutoComplete" : widgets_js,
			"glow.widgets.AutoSuggest" : widgets_js,
			"glow.widgets.Carousel" : widgets_js,
			"glow.widgets.Slider" : widgets_js
		},
		{
			$version : "1.2.1"
		},
		{
			$version : "1.2.2"
		},
		{
			$version : "1.3.0"
		},
		{
			$version : "1.3.1"
		},
		{
			$version : "1.3.2"
		},
		{
			$version : "1.3.3"
		},
		{
			$version : "1.3.4"
		},
		{
			$version : "1.3.5"
		},
		{
			// Release Candidate 1 for version 1.4.0.
			$version : "1.4.0-rc1",
			"glow.widgets.Editor" : widgets_js,
			"glow.widgets.Timetable" : widgets_js
		},
		{
			$version : "1.4.0"
		},
		{
			$version : "1.4.1"
		},
		{
			$version : "1.4.2"
		},
		{
			$version : "1.4.3"
		},
		{
			// Version 1.5.0 Release Candidate 1 - significant changes to core and widgets.
			$version : "1.5.0-rc1",
			"glow" : core_150_js,
			"glow.anim" : core_150_js,
			"glow.data" : core_150_js,
			"glow.debug" : core_150_js,
			"glow.dom" : core_150_js,
			"glow.dragdrop" : core_150_js,
			"glow.embed" : core_150_js,
			"glow.events" : core_150_js,
			"glow.forms" : core_150_js,
			"glow.net" : core_150_js,
			"glow.tweens" : core_150_js,

			"glow.widgets" : [widgets_150_js, "{$base}widgets/widgets.css"],
			"glow.widgets.AutoComplete" : widgets_150_js,
			"glow.widgets.AutoSuggest" : widgets_150_js,
			"glow.widgets.Carousel" : widgets_150_js,
			"glow.widgets.Editor" : widgets_150_js,
			"glow.widgets.InfoPanel" : widgets_150_js,
			"glow.widgets.Mask" : widgets_150_js,
			"glow.widgets.Overlay" : widgets_150_js,
			"glow.widgets.Panel" : widgets_150_js,
			"glow.widgets.Slider" : widgets_150_js,
			"glow.widgets.Sortable" : widgets_150_js,
			"glow.widgets.Timetable" : widgets_150_js

		},
		{
			$version : "1.5.0-rc2"
		},
		{
			$version : "1.5.0"
		},
		{
			$version : "1.5.1"
		},
		{
			// Version 1.6.0 Release Candidate 1 - adds i18n support.
			$version : "1.6.0-rc1",
			"glow.i18n" : core_150_js
		},
		{
			$version : "1.6.0-rc2"
		},
		{
			$version : "1.6.0"
		},
		{
			$version : "1.6.1"
		},
		{
			$version : "1.7.0-rc1"
		},
		{
			$version : "1.7.0"
		}
	) ;

} ) ( ) ; // This marks the end of the closure.
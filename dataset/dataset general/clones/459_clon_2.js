/*
 *	JavaScript Content Composer for Web Forms
 *	Project: 		Formatic Editor
 *	Developer: 		Adrian Petrov
 *	Web Address: 	https://adrianpetrov.dev/formatic
 *	Revision: 		2.0
 *	Licensing:
 *		Copyright (c) 2013 Adrian Petrov
 *		Authorization is hereby granted, free of charge, to any individual obtaining a copy
 *		of this software package and related documentation files (the "Software"), to process
 *		the Software without restriction, including without limitation the rights
 *		to utilize, duplicate, alter, distribute, sublicense, and/or vend
 *		copies of this Software to others, subject to the following conditions:
 *
 *		The above copyright notice and this permission statement shall be included in
 *		all copies or substantial portions of the Software.
 *
 *		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT ANY WARRANTY OF ANY KIND, EXPRESS OR
 *		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *		FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 *		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *		WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 *		IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *	Usage Instructions:
 *		backend(CMS):
 *			formatic_editor_init( $configurations );
 *		frontend(jQuery):
 *			jQuery('textarea').content_composer( editor_options );
 */

;(function( jQueryRef, globalScope ) {
	jQueryRef.fn.content_composer = function( user_settings ) {

		if( !jQueryRef(this).is('textarea') )
			globalScope.console.warn('The selected DOM element must be a textarea.');

		if( typeof globalScope.visualEditorPrep === 'undefined' || typeof globalScope.quickMarkup === 'undefined' || typeof globalScope.app_settings === 'undefined' )
			globalScope.console.warn('The function formatic_editor_init( $configurations ); must be loaded on the server side.');

		if( !jQueryRef(this).is('textarea') || typeof globalScope.visualEditorPrep === 'undefined' || typeof globalScope.quickMarkup === 'undefined' || typeof globalScope.app_settings === 'undefined' )
			return this;
		
		var preset_configurations = {
			'display_mode': 'plain_text',
			'editor_init_params' : {
				"theme": "modern",
				"skin": "lightgray",
				"language": "en",
				"formats": {
					"align_left": [
						{
							"selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
							"styles": {"textAlign":"left"},
							"deep": false,
							"remove": "none"
						},
						{
							"selector": "img,table,dl.wp-caption",
							"classes": ["alignleft"],
							"deep":false,
							"remove":"none"
						}
					],
					"align_center": [
						{
							"selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
							"styles": {"textAlign":"center"},
							"deep": false,
							"remove": "none"
						},
						{
							"selector": "img,table,dl.wp-caption",
							"classes": ["aligncenter"],
							"deep": false,
							"remove": "none"
						}
					],
					"align_right": [
						{
							"selector": "p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li",
							"styles": {"textAlign":"right"},
							"deep": false,
							"remove": "none"
						},
						{
							"selector": "img,table,dl.wp-caption",
							"classes": ["alignright"],
							"deep": false,
							"remove": "none"
						}
					],
					"strikethrough_text": {"inline":"del","deep":true,"split":true}
				},
				"relative_urls": false,
				"remove_script_host": false,
				"convert_urls": false,
				"browser_spellcheck": true,
				"fix_list_elements": true,
				"entities": "38,amp,60,lt,62,gt",
				"entity_encoding": "raw",
				"keep_styles": false,
				"paste_webkit_styles": "font-weight font-style color",
				"preview_styles": "font-family font-size font-weight font-style text-decoration text-transform",
				"wpeditimage_disable_captions": false,
				"wpeditimage_html5_captions": false,
				"plugins": "charmap,hr,media,paste,tabfocus,textcolor,fullscreen,wordpress,wpeditimage,wpgallery,wplink,wpdialogs,wpview,image",
				"content_css": globalScope.app_settings.resource_path + "css/dashicons.css?ver=3.9," + globalScope.app_settings.resource_path + "js/mediaelement/mediaelementplayer.min.css?ver=3.9," + globalScope.app_settings.resource_path + "js/mediaelement/wp-mediaelement.css?ver=3.9," + globalScope.app_settings.resource_path + "js/tinymce/skins/wordpress/wp-content.css?ver=3.9",
				"element_selector": "#base_id",
				"resize": "vertical",
				"menubar": false,
				"auto_paragraphs": true,
				"indent": false,
				"toolbar1": "bold,italic,strikethrough,bullist,numlist,blockquote,hr,alignleft,aligncenter,alignright,link,unlink,wp_more,spellchecker,fullscreen,wp_adv",
				"toolbar2": "formatselect,underline,alignjustify,forecolor,pastetext,removeformat,charmap,outdent,indent,undo,redo,wp_help",
				"toolbar3": "",
				"toolbar4": "",
				"focus_navigation_elements": ":prev,:next",
				"document_body_class": "base_id"
			}
		}, id_pattern = new RegExp('base_id', 'g');

		if(globalScope.visualEditorPrep.editor_init_params['base_id']) {
			preset_configurations.editor_init_params = globalScope.visualEditorPrep.editor_init_params['base_id'];
		}

		var final_config = jQueryRef.extend(true, preset_configurations, user_settings);

		return this.each(function() {

			if( !jQueryRef(this).is('textarea') )
				globalScope.console.warn('Current element must be a textarea for the composer to initialize.');
			else {
				var current_element_id = jQueryRef(this).attr('id');
				
				jQueryRef.each( final_config.editor_init_params, function( prop_name, prop_value ) {
					if( jQueryRef.type( prop_value ) == 'string' ) {
						final_config.editor_init_params[prop_name] = prop_value.replace(id_pattern, current_element_id);
					}
				} );
				
				final_config.display_mode = (final_config.display_mode === 'rich_text_mode') ? 'rich_text_mode' : 'plain_text_mode';

				globalScope.visualEditorPrep.editor_init_params[current_element_id] = final_config.editor_init_params;

				jQueryRef(this).addClass('editor-content-area').show();
				var current_node = this;
				if( jQueryRef(this).closest('.composer-container').length ) {
					var parent_element_ref = jQueryRef(this).closest('.composer-container').parent();
					jQueryRef(this).closest('.composer-container').before(jQueryRef(this).clone());
					jQueryRef(this).closest('.composer-container').remove();
					current_node = parent_element_ref.find('textarea[id="' + current_element_id + '"]');
				}

				var container_element = jQueryRef('<div id="composer-' + current_element_id + '-wrapper" class="composer-core-style editor-wrapper ' + final_config.display_mode + '-active" />'),
					toolbar_section = jQueryRef('<div id="composer-' + current_element_id + '-toolbar" class="editor-toolbar hidden-if-no-js" />'),
					mode_tabs = jQueryRef('<div class="editor-mode-tabs" />'),
					text_mode_switcher = jQueryRef('<a id="' + current_element_id + '-plain_text" class="editor-mode-switcher switch-plain_text" onclick="globalScope.modeSwitchers.activate(this);">Markup</a>'),
					visual_mode_switcher = jQueryRef('<a id="' + current_element_id + '-rich_text" class="editor-mode-switcher switch-rich_text" onclick="globalScope.modeSwitchers.activate(this);">Rich Text</a>'),
					asset_buttons = jQueryRef('<div id="composer-' + current_element_id + '-asset-buttons" class="editor-asset-buttons" />'),
					add_asset_button = jQueryRef('<a href="#" id="insert-asset-btn" class="button embed-asset add_asset" data-composer-target="' + current_element_id + '" title="Embed Assets"><span class="asset-button-icon"></span> Embed Assets</a>'),
					content_display_area = jQueryRef('<div id="composer-' + current_element_id + '-display-area" class="editor-display-area" />'),
					style_references = /*Object.prototype.hasOwnProperty.call(globalScope.visualEditorPrep.editor_init_params[current_element_id], 'content_css') ? globalScope.visualEditorPrep.editor_init_params[current_element_id]['content_css'].split(',') :*/ false;

				add_asset_button.appendTo(asset_buttons);
				asset_buttons.appendTo(toolbar_section);

				text_mode_switcher.appendTo(mode_tabs);
				visual_mode_switcher.appendTo(mode_tabs);
				mode_tabs.appendTo(toolbar_section);

				toolbar_section.appendTo(container_element);
				content_display_area.appendTo(container_element);

				content_display_area.append(jQueryRef(current_node).clone().addClass('editor-content-area'));

				if( style_references !== false )
					jQueryRef.each( style_references, function() {
						if( ! jQueryRef('link[href="' + this + '"]').length )
							jQueryRef(current_node).before('<link rel="stylesheet" type="text/css" href="' + this + '">');
					} );

				jQueryRef(current_node).before('<link rel="stylesheet" id="composer-controls-styles" href="' + globalScope.app_settings.resource_path + 'css/control_panel.css" type="text/css" media="all">');

				jQueryRef(current_node).before(container_element);
				jQueryRef(current_node).remove();

				new globalScope.quickMarkup(current_element_id);
				globalScope.quickMarkup.initialize_buttons();
				globalScope.modeSwitchers.change_to(current_element_id, final_config.display_mode);

            	jQueryRef(container_element).on( 'click', '.embed-asset', function( event_object ) {
					var clicked_element = jQueryRef( event_object.currentTarget ),
						target_composer = clicked_element.data('composer-target'),
						manager_options = {
							frame:    'post',
							state:    'insert',
							title:    globalScope.media_manager.view.localization.addAsset,
							multiple: true
						};

					event_object.preventDefault();

					clicked_element.blur();

					if ( clicked_element.hasClass( 'gallery' ) ) {
						manager_options.state = 'gallery';
						manager_options.title = globalScope.media_manager.view.localization.createGalleryTitle;
					}

					globalScope.media_manager.composer.launch( target_composer, manager_options );
				});
			}
		});
	}
})( jQuery, window )
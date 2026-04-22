function pick_visual_item(target_element) {
	// Wrap the DOM element with Prototype.js utility
	target_element = $(target_element);

	// Find parent UL, select all LI children, and remove a specific CSS class
	target_element.up('ul').select('li').invoke("removeClassName", "active-selection");
	// Add a specific CSS class to the parent LI of the target element
	target_element.up('li').addClassName('active-selection');
}

function process_thumbnail_selection(thumb_element) {
	// Wrap the DOM element with Prototype.js utility
	thumb_element = $(thumb_element);

	// Extract size from href attribute, split by '#' and get the second part
	const dimension_value = thumb_element.getAttribute('href').split('#')[1];
	// Navigate up to LI, remove class, then down to IMG
	const image_object = thumb_element.up('li').removeClassName("active-selection").down('img');
	// Replace '_thumb.' in the image source with the extracted size
	const image_source_path = image_object.src.gsub('_thumb.', dimension_value + '.');
	// Call a helper function to insert the image
	insert_media_content(image_source_path, image_object.getAttribute('alt'));
}

function handle_media_upload_complete(asset_url, descriptive_text, asset_identifier) {
	// Clear content of the target element identified by ID
	$('image_uploaded_data').clear();
	// Make an asynchronous AJAX request to refresh the image list
	new Ajax.Request("/tiny_mce_photos/?page=1", {asynchronous:true, evalScripts:true, method:'get'});
}

function insert_media_content(media_url_path, descriptive_alt_text) {
	// Obtain the reference to the form element
	const current_form_handle = get_html_form_reference();
	// Set the source and alt text values in the form
	current_form_handle.src.value = media_url_path;
	current_form_handle.alt.value = descriptive_alt_text;
	// Display a specific tab and panel in the UI
	mcTabs.displayTab('general_tab','general_panel');
	// Show a preview image in the dialog
	ImageDialog.showPreviewImage(media_url_path);
}

function get_html_form_reference() {
	// Return the second form element from the document's forms collection
	return document.forms[1];
}

function initialize_page_load() {
	// Update content of a dynamic image list with a loading message and spinner
	$('dynamic_images_list').update("Loading content...<br /><img src='/images/tiny_mce/spinner.gif'>");
	// Display the dynamic image selection tab and panel
	mcTabs.displayTab('dynamic_select_tab','dynamic_select_panel');

	// Create an iframe element dynamically for image uploads
	const upload_frame = create_dom_element('iframe','html_editor_image_upload_frame');
	upload_frame.setAttribute('src','about:blank');
	upload_frame.style.border="0px none";
	upload_frame.style.position="absolute";
	upload_frame.style.width="1px";
	upload_frame.style.height="1px";
	upload_frame.style.visibility="hidden";
	upload_frame.setAttribute('id','html_editor_image_upload_frame');
	// Append the created iframe to the image-upload container
	$('image-upload').appendChild(upload_frame);
	// Set the action attribute for the image upload form
	$('image_upload_form').setAttribute("action", get_image_upload_endpoint());
}

function get_image_upload_endpoint() {
	// Return the URL for image creation
	return '/tiny_mce_photos/create';
}

function create_dom_element(tag_name, element_name) {
	let created_element;
	// Handle IE specific element creation for older versions
	if (element_name && window.ActiveXObject) {
		created_element = document.createElement('<'+tag_name+' name="'+element_name+'">');
	} else {
		// Standard element creation
		created_element = document.createElement(tag_name);
		created_element.setAttribute('name',element_name);
	}
	return created_element;
}


const ImageDialog = {
	// Pre-initialization routine for the dialog
	preInit : function() {
		let external_url;

		// Load language pack for TinyMCE popup
		tinyMCEPopup.requireLangPack();

		// Check for an external image list URL parameter and load it if present
		if (external_url = tinyMCEPopup.getParam("external_image_list_url"))
			document.write('<script language="javascript" type="text/javascript" src="' + tinyMCEPopup.editor.documentBaseURI.toAbsolute(external_url) + '"></script>');
	},

	// Main initialization function for the dialog
	init : function(editor_instance) {
		// Get form reference, form elements, editor instance, DOM manipulator, and selected node
		const dialog_form = get_html_form_reference(),
			  form_fields = dialog_form.elements,
			  current_editor = tinyMCEPopup.editor,
			  dom_util = current_editor.dom,
			  selected_node_element = current_editor.selection.getNode();

		// Resize the popup to fit its content
		tinyMCEPopup.resizeToInnerSize();
		// Populate various list boxes
		this.fillClassList('class_list');
		this.fillFileList('src_list', 'tinyMCEImageList');
		this.fillFileList('over_list', 'tinyMCEImageList');
		this.fillFileList('out_list', 'tinyMCEImageList');

		// If the selected node is an image, populate dialog fields with its attributes
		if (selected_node_element.nodeName === 'IMG') {
			form_fields.src.value = dom_util.getAttrib(selected_node_element, 'src');
			form_fields.width.value = dom_util.getAttrib(selected_node_element, 'width');
			form_fields.height.value = dom_util.getAttrib(selected_node_element, 'height');
			form_fields.alt.value = dom_util.getAttrib(selected_node_element, 'alt');
			form_fields.title.value = dom_util.getAttrib(selected_node_element, 'title');
			form_fields.vspace.value = this.getAttrib(selected_node_element, 'vspace');
			form_fields.hspace.value = this.getAttrib(selected_node_element, 'hspace');
			form_fields.border.value = this.getAttrib(selected_node_element, 'border');
			selectByValue(dialog_form, 'align', this.getAttrib(selected_node_element, 'align'));
			selectByValue(dialog_form, 'class_list', dom_util.getAttrib(selected_node_element, 'class'));
			form_fields.style.value = dom_util.getAttrib(selected_node_element, 'style');
			form_fields.id.value = dom_util.getAttrib(selected_node_element, 'id');
			form_fields.dir.value = dom_util.getAttrib(selected_node_element, 'dir');
			form_fields.lang.value = dom_util.getAttrib(selected_node_element, 'lang');
			form_fields.usemap.value = dom_util.getAttrib(selected_node_element, 'usemap');
			form_fields.longdesc.value = dom_util.getAttrib(selected_node_element, 'longdesc');
			form_fields.insert.value = current_editor.getLang('update');

			// Check and populate onmouseover source
			if (/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/.test(dom_util.getAttrib(selected_node_element, 'onmouseover')))
				form_fields.onmouseoversrc.value = dom_util.getAttrib(selected_node_element, 'onmouseover').replace(/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/, '$1');

			// Check and populate onmouseout source
			if (/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/.test(dom_util.getAttrib(selected_node_element, 'onmouseout')))
				form_fields.onmouseoutsrc.value = dom_util.getAttrib(selected_node_element, 'onmouseout').replace(/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/, '$1');

			// If inline styles are enabled, move attributes to styles
			if (current_editor.settings.inline_styles) {
				// Transfer attributes to styles
				if (dom_util.getAttrib(selected_node_element, 'align'))
					this.updateStyle('align');

				if (dom_util.getAttrib(selected_node_element, 'hspace'))
					this.updateStyle('hspace');

				if (dom_util.getAttrib(selected_node_element, 'border'))
					this.updateStyle('border');

				if (dom_util.getAttrib(selected_node_element, 'vspace'))
					this.updateStyle('vspace');
			}
		}

		// Setup browse button for image source
		document.getElementById('srcbrowsercontainer').innerHTML = getBrowserHTML('srcbrowser','src','image','theme_advanced_image');
		if (isVisible('srcbrowser'))
			document.getElementById('src').style.width = '260px';

		// Setup browse button for onmouseover source (commented out in original)
		// document.getElementById('onmouseoversrccontainer').innerHTML = getBrowserHTML('overbrowser','onmouseoversrc','image','theme_advanced_image');
		// if (isVisible('overbrowser'))
		// 	document.getElementById('onmouseoversrc').style.width = '260px';
		//
		// // Setup browse button for onmouseout source (commented out in original)
		// document.getElementById('onmouseoutsrccontainer').innerHTML = getBrowserHTML('outbrowser','onmouseoutsrc','image','theme_advanced_image');
		// if (isVisible('outbrowser'))
		// 	document.getElementById('onmouseoutsrc').style.width = '260px';

		// If option enabled, default constrain proportions to checked
		if (current_editor.getParam("advimage_constrain_proportions", true))
			dialog_form.constrain.checked = true;

		// Check swap image if valid data (commented out in original)
		// if (form_fields.onmouseoversrc.value || form_fields.onmouseoutsrc.value)
		// 	this.setSwapImage(true);
		// else
		// 	this.setSwapImage(false);

		// Update appearance and show preview image
		this.changeAppearance();
		this.showPreviewImage(form_fields.src.value, 1);
	},

	// Function to insert the image into the editor
	insert : function(image_file, image_title) {
		const current_editor = tinyMCEPopup.editor,
			  dialog_this_ref = this,
			  dialog_form = get_html_form_reference();

		// If source is empty, remove existing image or close dialog
		if (dialog_form.src.value === '') {
			if (current_editor.selection.getNode().nodeName === 'IMG') {
				current_editor.dom.remove(current_editor.selection.getNode());
				current_editor.execCommand('mceRepaint');
			}
			tinyMCEPopup.close();
			return;
		}

		// Check for accessibility warnings if enabled
		if (tinyMCEPopup.getParam("accessibility_warnings", 1)) {
			if (!dialog_form.alt.value) {
				tinyMCEPopup.editor.windowManager.confirm(tinyMCEPopup.getLang('advimage_dlg.missing_alt'), function(confirm_result) {
					if (confirm_result)
						dialog_this_ref.insertAndClose();
				});
				return;
			}
		}

		dialog_this_ref.insertAndClose();
	},

	// Function to insert the image and close the dialog
	insertAndClose : function() {
		const current_editor = tinyMCEPopup.editor,
			  dialog_form = get_html_form_reference(),
			  form_fields = dialog_form.elements;
		let   temp_value,
			  attribute_arguments = {},
			  target_element;

		// Fix for Safari crashes
		if (tinymce.isWebKit)
			current_editor.getWin().focus();

		// Determine attributes based on inline styles setting
		if (!current_editor.settings.inline_styles) {
			attribute_arguments = {
				vspace : form_fields.vspace.value,
				hspace : form_fields.hspace.value,
				border : form_fields.border.value,
				align : getSelectValue(dialog_form, 'align')
			};
		} else {
			// Clear deprecated values if inline styles are used
			attribute_arguments = {
				vspace : '',
				hspace : '',
				border : '',
				align : ''
			};
		}

		// Extend arguments with common image attributes
		tinymce.extend(attribute_arguments, {
			src : form_fields.src.value,
			width : form_fields.width.value,
			height : form_fields.height.value,
			alt : form_fields.alt.value,
			title : form_fields.title.value,
			'class' : getSelectValue(dialog_form, 'class_list'),
			style : form_fields.style.value
			// id : form_fields.id.value,
			// dir : form_fields.dir.value,
			// lang : form_fields.lang.value,
			// usemap : form_fields.usemap.value,
			// longdesc : form_fields.longdesc.value
		});

		// onmouseover and onmouseout handling (commented out in original)
		// attribute_arguments.onmouseover = attribute_arguments.onmouseout = '';
		//
		// if (dialog_form.onmousemovecheck.checked) {
		// 	if (form_fields.onmouseoversrc.value)
		// 		attribute_arguments.onmouseover = "this.src='" + form_fields.onmouseoversrc.value + "';";
		//
		// 	if (form_fields.onmouseoutsrc.value)
		// 		attribute_arguments.onmouseout = "this.src='" + form_fields.onmouseoutsrc.value + "';";
		// }

		// Get the currently selected node
		target_element = current_editor.selection.getNode();

		// If an image is already selected, update its attributes
		if (target_element && target_element.nodeName === 'IMG') {
			current_editor.dom.setAttribs(target_element, attribute_arguments);
		} else {
			// Otherwise, insert a new image with a temporary ID, set attributes, and clear ID
			current_editor.execCommand('mceInsertContent', false, '<img id="__mce_tmp" src="javascript:;" />', {skip_undo : 1});
			current_editor.dom.setAttribs('__mce_tmp', attribute_arguments);
			current_editor.dom.setAttrib('__mce_tmp', 'id', '');
			current_editor.undoManager.add();
		}

		tinyMCEPopup.close();
	},

	// Helper to get an attribute value, considering inline styles
	getAttrib : function(dom_element, attribute_key) {
		const current_editor = tinyMCEPopup.editor,
			  dom_util = current_editor.dom;
		let   primary_value,
			  secondary_value;

		if (current_editor.settings.inline_styles) {
			switch (attribute_key) {
				case 'align':
					if (primary_value = dom_util.getStyle(dom_element, 'float'))
						return primary_value;

					if (primary_value = dom_util.getStyle(dom_element, 'vertical-align'))
						return primary_value;

					break;

				case 'hspace':
					primary_value = dom_util.getStyle(dom_element, 'margin-left');
					secondary_value = dom_util.getStyle(dom_element, 'margin-right');

					if (primary_value && primary_value === secondary_value)
						return parseInt(primary_value.replace(/[^0-9]/g, ''), 10);

					break;

				case 'vspace':
					primary_value = dom_util.getStyle(dom_element, 'margin-top');
					secondary_value = dom_util.getStyle(dom_element, 'margin-bottom');
					if (primary_value && primary_value === secondary_value)
						return parseInt(primary_value.replace(/[^0-9]/g, ''), 10);

					break;

				case 'border':
					primary_value = 0;

					tinymce.each(['top', 'right', 'bottom', 'left'], function(side_name) {
						side_name = dom_util.getStyle(dom_element, 'border-' + side_name + '-width');

						// If no value or value differs from previous, reset to 0
						if (!side_name || (side_name !== primary_value && primary_value !== 0)) {
							primary_value = 0;
							return false;
						}

						if (side_name)
							primary_value = side_name;
					});

					if (primary_value)
						return parseInt(primary_value.replace(/[^0-9]/g, ''), 10);

					break;
			}
		}

		// Fallback to direct attribute retrieval
		if (primary_value = dom_util.getAttrib(dom_element, attribute_key))
			return primary_value;

		return '';
	},

	// Sets the state of swap image fields
	setSwapImage : function(is_enabled) {
		const dialog_form = get_html_form_reference();

		dialog_form.onmousemovecheck.checked = is_enabled;
		setBrowserDisabled('overbrowser', !is_enabled);
		setBrowserDisabled('outbrowser', !is_enabled);

		if (dialog_form.over_list)
			dialog_form.over_list.disabled = !is_enabled;

		if (dialog_form.out_list)
			dialog_form.out_list.disabled = !is_enabled;

		dialog_form.onmouseoversrc.disabled = !is_enabled;
		dialog_form.onmouseoutsrc.disabled  = !is_enabled;
	},

	// Populates a dropdown list with CSS class options
	fillClassList : function(list_id) {
		const dom_api = tinyMCEPopup.dom,
			  target_list = dom_api.get(list_id);
		let   config_value,
			  class_options;

		if (config_value = tinyMCEPopup.getParam('theme_advanced_styles')) {
			class_options = [];

			tinymce.each(config_value.split(';'), function(item_value) {
				const parts = item_value.split('=');
				class_options.push({'title' : parts[0], 'class' : parts[1]});
			});
		} else
			class_options = tinyMCEPopup.editor.dom.getClasses();

		if (class_options.length > 0) {
			target_list.options[target_list.options.length] = new Option(tinyMCEPopup.getLang('not_set'), '');

			tinymce.each(class_options, function(option_item) {
				target_list.options[target_list.options.length] = new Option(option_item.title || option_item['class'], option_item['class']);
			});
		} else
			dom_api.remove(dom_api.getParent(list_id, 'tr'));
	},

	// Populates a dropdown list with file options
	fillFileList : function(list_id, list_name) {
		const dom_api = tinyMCEPopup.dom,
			  target_list = dom_api.get(list_id);
		let   config_value,
			  class_options;

		const file_data_list = window[list_name];

		if (file_data_list && file_data_list.length > 0) {
			target_list.options[target_list.options.length] = new Option('', '');

			tinymce.each(file_data_list, function(file_entry) {
				target_list.options[target_list.options.length] = new Option(file_entry[0], file_entry[1]);
			});
		} else
			dom_api.remove(dom_api.getParent(list_id, 'tr'));
	},

	// Resets image dimension data in the form
	resetImageData : function() {
		const dialog_form = get_html_form_reference();

		dialog_form.elements.width.value = dialog_form.elements.height.value = '';
	},

	// Updates image dimension data in the form
	updateImageData : function(image_element, is_initial_load) {
		const dialog_form = get_html_form_reference();

		if (!is_initial_load) {
			dialog_form.elements.width.value = image_element.width;
			dialog_form.elements.height.value = image_element.height;
		}

		this.preloadImg = image_element;
	},

	// Changes the appearance of a sample image based on form values
	changeAppearance : function() {
		const current_editor = tinyMCEPopup.editor,
			  dialog_form = get_html_form_reference(),
			  sample_image_element = document.getElementById('alignSampleImg');

		if (sample_image_element) {
			if (current_editor.getParam('inline_styles')) {
				current_editor.dom.setAttrib(sample_image_element, 'style', dialog_form.style.value);
			} else {
				sample_image_element.align = dialog_form.align.value;
				sample_image_element.border = dialog_form.border.value;
				sample_image_element.hspace = dialog_form.hspace.value;
				sample_image_element.vspace = dialog_form.vspace.value;
			}
		}
	},

	// Adjusts height based on width and aspect ratio
	changeHeight : function() {
		const dialog_form = get_html_form_reference(),
			  calculated_proportion,
			  dialog_this_ref = this;

		if (!dialog_form.constrain.checked || !dialog_this_ref.preloadImg) {
			return;
		}

		if (dialog_form.width.value === "" || dialog_form.height.value === "")
			return;

		calculated_proportion = (parseInt(dialog_form.width.value, 10) / parseInt(dialog_this_ref.preloadImg.width, 10)) * dialog_this_ref.preloadImg.height;
		dialog_form.height.value = calculated_proportion.toFixed(0);
	},

	// Adjusts width based on height and aspect ratio
	changeWidth : function() {
		const dialog_form = get_html_form_reference(),
			  calculated_proportion,
			  dialog_this_ref = this;

		if (!dialog_form.constrain.checked || !dialog_this_ref.preloadImg) {
			return;
		}

		if (dialog_form.width.value === "" || dialog_form.height.value === "")
			return;

		calculated_proportion = (parseInt(dialog_form.height.value, 10) / parseInt(dialog_this_ref.preloadImg.height, 10)) * dialog_this_ref.preloadImg.width;
		dialog_form.width.value = calculated_proportion.toFixed(0);
	},

	// Updates the inline style of an image based on dialog fields
	updateStyle : function(style_attribute_type) {
		const dom_api = tinyMCEPopup.dom,
			  dialog_form = get_html_form_reference(),
			  temp_image_element = dom_api.create('img', {style : dom_api.get('style').value});
		let   attribute_value;

		if (tinyMCEPopup.editor.settings.inline_styles) {
			// Handle align style
			if (style_attribute_type === 'align') {
				dom_api.setStyle(temp_image_element, 'float', '');
				dom_api.setStyle(temp_image_element, 'vertical-align', '');

				attribute_value = getSelectValue(dialog_form, 'align');
				if (attribute_value) {
					if (attribute_value === 'left' || attribute_value === 'right')
						dom_api.setStyle(temp_image_element, 'float', attribute_value);
					else
						temp_image_element.style.verticalAlign = attribute_value;
				}
			}

			// Handle border style
			if (style_attribute_type === 'border') {
				dom_api.setStyle(temp_image_element, 'border', '');

				attribute_value = dialog_form.border.value;
				if (attribute_value || attribute_value === '0') {
					if (attribute_value === '0')
						temp_image_element.style.border = '';
					else
						temp_image_element.style.border = attribute_value + 'px solid black';
				}
			}

			// Handle horizontal space style
			if (style_attribute_type === 'hspace') {
				dom_api.setStyle(temp_image_element, 'marginLeft', '');
				dom_api.setStyle(temp_image_element, 'marginRight', '');

				attribute_value = dialog_form.hspace.value;
				if (attribute_value) {
					temp_image_element.style.marginLeft = attribute_value + 'px';
					temp_image_element.style.marginRight = attribute_value + 'px';
				}
			}

			// Handle vertical space style
			if (style_attribute_type === 'vspace') {
				dom_api.setStyle(temp_image_element, 'marginTop', '');
				dom_api.setStyle(temp_image_element, 'marginBottom', '');

				attribute_value = dialog_form.vspace.value;
				if (attribute_value) {
					temp_image_element.style.marginTop = attribute_value + 'px';
					temp_image_element.style.marginBottom = attribute_value + 'px';
				}
			}

			// Merge the updated styles back to the form field
			dom_api.get('style').value = dom_api.serializeStyle(dom_api.parseStyle(temp_image_element.style.cssText));
		}
	},

	// Placeholder function for mouse move event handling
	changeMouseMove : function() {
	},

	// Displays a preview image in the dialog
	showPreviewImage : function(image_url, is_initial_status) {
		// If no URL is provided, clear the preview area
		if (!image_url) {
			tinyMCEPopup.dom.setHTML('prev', '');
			return;
		}

		// Reset image data if not initial load and update dimensions is enabled
		if (!is_initial_status && tinyMCEPopup.getParam("advimage_update_dimensions_onchange", true))
			this.resetImageData();

		// Convert URL to absolute path
		image_url = tinyMCEPopup.editor.documentBaseURI.toAbsolute(image_url);

		// Set HTML for preview image, with different onload handlers for initial vs. subsequent loads
		if (!is_initial_status)
			tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + image_url + '" border="0" onload="ImageDialog.updateImageData(this);" onerror="ImageDialog.resetImageData();" />');
		else
			tinyMCEPopup.dom.setHTML('prev', '<img id="previewImg" src="' + image_url + '" border="0" onload="ImageDialog.updateImageData(this, 1);" />');
	}
};

// Initialize the ImageDialog pre-initialization routine
ImageDialog.preInit();
// Add the main initialization function to TinyMCE popup's onInit event
tinyMCEPopup.onInit.add(ImageDialog.init, ImageDialog);
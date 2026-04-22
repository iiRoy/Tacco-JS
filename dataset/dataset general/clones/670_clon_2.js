(function(jQ){
var proc_data_edit = {};
jQ.dataGridCore.addMethods({
	queryDataGrid : function (opts_config) {
		opts_config = jQ.assign_defaults({
			rebuildCriteria: false,
			draggable: true,
			fieldParam:'searchField',
			valueParam:'searchString',
			operatorParam: 'searchOper',
			filterParam: 'filters',
            loadInitialSettings: true,
			beforeDisplaySearch: null,
			afterDisplaySearch : null,
			onSetupSearch: null,
			afterPaint : null,
			hideAfterQuery : false,
			hideAfterClear: false,
			hideOnEscape : false,
			multiCriteria : false,
			multiGrouping : false,
			topOffset : 0,
			leftOffset: 0,
			isModalDialog : true,
			isModal: false,
			resizable : true,
			dialogWidth: 450,
			dialogHeight: 'auto',
			contentHeight: 'auto',
			displayQueryString: false,
			checkInputErrors : true,
			// query operators list
			// if you want to change or remove the order change it in sopt
			// ['eq','ne','lt','le','gt','ge','bw','bn','in','ni','ew','en','cn','nc'],
			operatorsList: null,
			resultAsString: undefined,
			onDialogClose : null,
			onCriteriaSearch : null,
			onCriteriaReset : null,
			bringToFront : true,
			dialogOverlay : 30,
			columnDefs : [],
			templateNames : null,
			templateFilters : null,
			// labels for templates
			templateLabelText : ' View Template: ',
            showOnLoadFlag: false,
            overlayLayer: null
		}, jQ.dataGridCore.searchOptions, opts_config || {});
		return this.each_element(function() {
			var grid_elem = this;
			if(!grid_elem.grid) { return; }
			var filter_area_id = "filterBox_"+grid_elem.p.id,
			should_show_dialog = true,
			dialog_elements = {themodal:'search_dialog'+filter_area_id,modalhead:'search_header'+filter_area_id,modalcontent:'search_content'+filter_area_id, scrollelm : filter_area_id},
			initial_criteria  = grid_elem.p.postData[opts_config.filterParam];
			if(typeof(initial_criteria) === "string") {
				initial_criteria = jQ.dataGridCore.deserialize( initial_criteria );
			}
			if(opts_config.rebuildCriteria === true) {
				jQ("#"+dialog_elements.themodal).remove();
			}
			function displaySearchForm() {
				if(jQ.is_callable(opts_config.beforeDisplaySearch)) {
					should_show_dialog = opts_config.beforeDisplaySearch(jQ("#"+filter_area_id));
					if(typeof(should_show_dialog) === "undefined") {
						should_show_dialog = true;
					}
				}
				if(should_show_dialog) {
					jQ.dataGridCore.viewDialog("#"+dialog_elements.themodal,{gbox:"#gbox_"+filter_area_id,jqm:opts_config.isModalDialog, modal:opts_config.isModal, overlay: opts_config.dialogOverlay, toTop: opts_config.bringToFront});
					if(jQ.is_callable(opts_config.afterDisplaySearch)) {
						opts_config.afterDisplaySearch(jQ("#"+filter_area_id));
					}
				}
			}
			if ( jQ("#"+dialog_elements.themodal).html() !== null ) {
				displaySearchForm();
			} else {
				var search_wrapper = jQ("<div><div id='"+filter_area_id+"' class='queryFilterPanel' style='overflow:auto'></div></div>").insertBefore("#gview_"+grid_elem.p.id),
				text_align = "left", button_left_style =""; 
				if(grid_elem.p.direction == "rtl") {
					text_align = "right";
					button_left_style = " style='text-align:left'";
					search_wrapper.attr("dir","rtl");
				}
				if(jQ.is_callable(opts_config.onSetupSearch) ) {
					opts_config.onSetupSearch(jQ("#"+filter_area_id));
				}
				var column_definitions = jQ.extend([],grid_elem.p.colModel),
				search_btn_html  ="<a href='javascript:void(0)' id='"+filter_area_id+"_search_action' class='ui-button-form ui-state-default ui-corner-all ui-button-form-icon-right ui-reset-btn'><span class='ui-icon ui-icon-search'></span>"+opts_config.Find+"</a>",
				clear_btn_html  ="<a href='javascript:void(0)' id='"+filter_area_id+"_clear_action' class='ui-button-form ui-state-default ui-corner-all ui-button-form-icon-left ui-search-btn'><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span>"+opts_config.Reset+"</a>",
				query_btn_html = "", template_markup="", selected_col_name, found_searchable_col = false, all_buttons_html, col_model_idx=-1;
				if(opts_config.displayQueryString) {
					query_btn_html ="<a href='javascript:void(0)' id='"+filter_area_id+"_show_query' class='ui-button-form ui-state-default ui-corner-all ui-button-form-icon-left'><span class='ui-icon ui-icon-comment'></span>Show Query</a>";
				}
				if(!opts_config.columnDefs.length) {
					jQ.each(column_definitions, function(idx,col_def){
						if(!col_def.label) {
							col_def.label = grid_elem.p.colNames[idx];
						}
						// find first searchable column and set it if no default filter
						if(!found_searchable_col) {
							var is_searchable = (typeof col_def.search === 'undefined') ?  true: col_def.search ,
							is_hidden = (col_def.hidden === true),
							ignore_hiding_flag = (col_def.searchoptions && col_def.searchoptions.searchhidden === true);
							if ((ignore_hiding_flag && is_searchable) || (is_searchable && !is_hidden)) {
								found_searchable_col = true;
								selected_col_name = col_def.index || col_def.name;
								col_model_idx =idx;
							}
						}
					});
				} else {
					column_definitions = opts_config.columnDefs;
				}
				// backward compatibility
				if( (!initial_criteria && selected_col_name) || opts_config.multiCriteria === false  ) {
					var op_type = "eq";
					if(col_model_idx >=0 && column_definitions[col_model_idx].searchoptions && column_definitions[col_model_idx].searchoptions.sopt) {
						op_type = column_definitions[col_model_idx].searchoptions.sopt[0];
					} else if(opts_config.operatorsList && opts_config.operatorsList.length) {
						op_type = opts_config.operatorsList[0];
					}
					initial_criteria = {"groupOp": "AND",rules:[{"field":selected_col_name,"op":op_type,"data":""}]};
				}
				found_searchable_col = false;
				if(opts_config.templateNames && opts_config.templateNames.length) {
					found_searchable_col = true;
					template_markup = opts_config.templateLabelText;
					template_markup += "<select class='ui-criteria-template'>";
					template_markup += "<option value='default_template'>Default</option>";
					jQ.each(opts_config.templateNames, function(idx,item_name){
						template_markup += "<option value='"+idx+"'>"+item_name+"</option>";
					});
					template_markup += "</select>";
				}

				all_buttons_html = "<table class='ActionTable' style='border:0px none;margin-top:5px' id='"+filter_area_id+"_buttons'><tbody><tr><td colspan='2'><hr class='ui-widget-content-divider' style='margin:1px'/></td></tr><tr><td class='ActionButton' style='text-align:"+text_align+"'>"+clear_btn_html+template_markup+"</td><td class='ActionButton' "+button_left_style+">"+query_btn_html+search_btn_html+"</td></tr></tbody></table>";

				jQ("#"+filter_area_id).data_filter_control({
					columns : column_definitions,
					filter: opts_config.loadInitialSettings ? initial_criteria : null,
					showQuery: opts_config.displayQueryString,
					errorcheck : opts_config.checkInputErrors,
					sopt: opts_config.operatorsList,
					groupButton : opts_config.multiGrouping,
					ruleButtons : opts_config.multiCriteria,
					afterRedraw : opts_config.afterPaint,
					_gridsopt : jQ.dataGridCore.searchOptions.odata,
					onChange : function( query_obj ) {
						if(this.p.showQuery) {
							jQ('.query_display',this).html(this.toUserFriendlyString());
						}
					},
					direction : grid_elem.p.direction
				});
				search_wrapper.append( all_buttons_html );
				if(found_searchable_col && opts_config.templateFilters && opts_config.templateFilters.length) {
					jQ(".ui-criteria-template", search_wrapper).bind('change', function(e){
						var current_template_val = jQ(this).get_value();
						if(current_template_val=="default_template") {
							jQ("#"+filter_area_id).data_filter_control('addFilter', initial_criteria);
						} else {
							jQ("#"+filter_area_id).data_filter_control('addFilter', opts_config.templateFilters[parseInt(current_template_val,10)]);
						}
						return false;
					});
				}
				if(opts_config.multiGrouping === true) opts_config.multiCriteria = true;
				if(jQ.is_callable(opts_config.onSetupSearch) ) {
					opts_config.onSetupSearch(jQ("#"+filter_area_id));
				}
				opts_config.gbox = "#gbox_"+filter_area_id;
				if (opts_config.overlayLayer)
					jQ.dataGridCore.buildDialog(dialog_elements ,search_wrapper,opts_config,"#gview_"+grid_elem.p.id,jQ("#gbox_"+grid_elem.p.id)[0], "#"+opts_config.overlayLayer, {position: "relative"});
				else
					jQ.dataGridCore.buildDialog(dialog_elements ,search_wrapper,opts_config,"#gview_"+grid_elem.p.id,jQ("#gbox_"+grid_elem.p.id)[0]);
				if(query_btn_html) {
					jQ("#"+filter_area_id+"_show_query").bind('click', function(e){
						jQ(".query_result_display", search_wrapper).toggle();
						return false;
					});
				}
				if (opts_config.resultAsString===undefined) {
					// to provide backward compatibility, inferring stringResult value from multipleSearch
					opts_config.resultAsString = opts_config.multiCriteria;
				}
				jQ("#"+filter_area_id+"_search_action").bind('click', function(){
					var filter_control = jQ("#"+filter_area_id),
					request_payload={}, serialized_data_output ,
					query_filters = filter_control.data_filter_control('filterData');
					if(opts_config.checkInputErrors) {
						filter_control[0].hideError();
						if(!opts_config.displayQueryString) {filter_control.data_filter_control('toSQLString');}
						if(filter_control[0].p.error) {
							filter_control[0].showError();
							return false;
						}
					}

					if(opts_config.resultAsString) {
						try {
							// xmlJsonClass or JSON.stringify
							serialized_data_output = json_util_processor.to_json_string(query_filters, '', '', false);
						} catch (e) {
							try {
								serialized_data_output = JSON_parser.to_text(query_filters);
							} catch (e2) { }
						}
						if(typeof(serialized_data_output)==="string") {
							request_payload[opts_config.filterParam] = serialized_data_output;
							jQ.each([opts_config.fieldParam,opts_config.valueParam, opts_config.operatorParam], function() {request_payload[this] = "";});
						}
					} else {
						if(opts_config.multiCriteria) {
							request_payload[opts_config.filterParam] = query_filters;
							jQ.each([opts_config.fieldParam,opts_config.valueParam, opts_config.operatorParam], function() {request_payload[this] = "";});
						} else {
							request_payload[opts_config.fieldParam] = query_filters.rules[0].field;
							request_payload[opts_config.valueParam] = query_filters.rules[0].data;
							request_payload[opts_config.operatorParam] = query_filters.rules[0].op;
							request_payload[opts_config.filterParam] = "";
						}
					}
					grid_elem.p.search = true;
					jQ.extend(grid_elem.p.postData,request_payload);
					if(jQ.is_callable(opts_config.onCriteriaSearch) ) {
						opts_config.onCriteriaSearch();
					}
					jQ(grid_elem).trigger_event("refresh_grid_data",[{page:1}]);
					if(opts_config.hideAfterQuery) {
						jQ.dataGridCore.closeDialog("#"+dialog_elements.themodal,{gb:"#gbox_"+grid_elem.p.id,jqm:opts_config.isModalDialog,onClose: opts_config.onDialogClose});
					}
					return false;
				});
				jQ("#"+filter_area_id+"_clear_action").bind('click', function(){
					var request_payload={},
					filter_control = jQ("#"+filter_area_id);
					grid_elem.p.search = false;
					if(opts_config.multiCriteria===false) {
						request_payload[opts_config.fieldParam] = request_payload[opts_config.valueParam] = request_payload[opts_config.operatorParam] = "";
					} else {
						request_payload[opts_config.filterParam] = "";
					}
					filter_control[0].resetFilter();
					if(found_searchable_col) {
						jQ(".ui-criteria-template", search_wrapper).get_value("default_template");
					}
					jQ.extend(grid_elem.p.postData,request_payload);
					if(jQ.is_callable(opts_config.onCriteriaReset) ) {
						opts_config.onCriteriaReset();
					}
					jQ(grid_elem).trigger_event("refresh_grid_data",[{page:1}]);
					return false;
				});
				jQ(".ui-button-form:not(.ui-state-disabled)",search_wrapper).hover(
				   function(){jQ(this).addClass('ui-state-hover-active');},
				   function(){jQ(this).removeClass('ui-state-hover-active');}
				);
			}
		});
	},
	modifyGridEntry : function(entry_identifier, dialog_settings){
		dialog_settings = jQ.assign_defaults({
			dialogTop : 0,
			dialogLeft: 0,
			dialogWidth: 300,
			dialogHeight: 'auto',
			contentHeight: 'auto',
			isModal: false,
			dialogOverlay : 30,
			draggable: true,
			resizable: true,
			submitUrl: null,
			requestType : "POST",
			clearFormAfterAdd :true,
			closeAfterUpdate : false,
			reloadAfterSubmission : true,
			onInitializeEditForm: null,
			beforeDataLoad: null,
			beforeFormDisplay: null,
			afterFormDisplay: null,
			beforeFormSubmit: null,
			afterFormSubmit: null,
			onClickSubmit: null,
			afterSubmissionComplete: null,
			onClickPagerButtons : null,
			afterClickPagerButtons: null,
			extraEditData : {},
			rebuildForm : false,
			isModalDialog : true,
			closeOnEscape : false,
			addedRowPosition : "first",
			topInformation : '',
			bottomInformation: '',
			saveIconConfig : [],
			closeIconConfig : [],
			saveKeyBinding: [false,13],
			navigationKeyBinding: [false,38,40],
			checkBeforeSubmit : false,
			checkOnFieldUpdate : false,
			_cachedData : {},
			isProcessing : false,
			onDialogClose : null,
			ajaxEditSettings : {},
			serializeEditPayload : null,
			displayPagerButtons : true
		}, jQ.dataGridCore.editOptions, dialog_settings || {});
		proc_data_edit[jQ(this)[0].p.id] = dialog_settings;
		return this.each_element(function(){
			var grid_elem = this;
			if (!grid_elem.grid || !entry_identifier) { return; }
			var grid_id_val = grid_elem.p.id,
			form_grid_wrapper = "EditFormGrid_"+grid_id_val, form_table_body = "TableFormGrid_"+grid_id_val,
			dialog_elements = {themodal:'edit_dialog'+grid_id_val,modalhead:'edit_header'+grid_id_val,modalcontent:'edit_content'+grid_id_val, scrollelm : form_grid_wrapper},
			before_display_cb = jQ.is_callable(proc_data_edit[grid_elem.p.id].beforeFormDisplay) ? proc_data_edit[grid_elem.p.id].beforeFormDisplay : false,
			after_form_shown_cb = jQ.is_callable(proc_data_edit[grid_elem.p.id].afterFormDisplay) ? proc_data_edit[grid_elem.p.id].afterFormDisplay : false,
			before_init_data_cb = jQ.is_callable(proc_data_edit[grid_elem.p.id].beforeDataLoad) ? proc_data_edit[grid_elem.p.id].beforeDataLoad : false,
			on_init_form_cb = jQ.is_callable(proc_data_edit[grid_elem.p.id].onInitializeEditForm) ? proc_data_edit[grid_elem.p.id].onInitializeEditForm : false,
			copied_info = null,
			should_show_dialog = true,
			max_cols_count = 1, max_rows_count=0,	post_data_map, extra_post_data, new_entry_data, data_difference;
			if (entry_identifier === "new_entry") {
				entry_identifier = "_empty";
				dialog_settings.caption=proc_data_edit[grid_elem.p.id].addCaption;
			} else {
				dialog_settings.caption=proc_data_edit[grid_elem.p.id].editCaption;
			}
			if(dialog_settings.rebuildForm===true && jQ("#"+dialog_elements.themodal).html() !== null) {
				jQ("#"+dialog_elements.themodal).remove();
			}
			var close_overlay_flag = true;
			if(dialog_settings.checkOnFieldUpdate && dialog_settings.isModalDialog && !dialog_settings.isModal) {
				close_overlay_flag = false;
			}
			function extractFormData(){
				jQ("#"+form_table_body+" > tbody > tr > td > .FormElement").each(function(idx) {
					var custom_element_field = jQ(".custom_field_element", this);
					if (custom_element_field.length) {
						var  field_dom_element = custom_element_field[0], field_name = jQ(field_dom_element).attr('name');
						jQ.each(grid_elem.p.colModel, function(idx,col_def_item){
							if(this.name === field_name && this.editoptions && jQ.is_callable(this.editoptions.custom_value)) {
								try {
									post_data_map[field_name] = this.editoptions.custom_value(jQ("#"+jQ.dataGridCore.escapeId(field_name),"#"+form_table_body),'get');
									if (post_data_map[field_name] === undefined) {throw "error_val1";}
								} catch (e) {
									if (e==="error_val1") {jQ.dataGridCore.infoBox(jQ.dataGridCore.messages.errorTitle,"function 'custom_value' "+jQ.dataGridCore.editOptions.msg.novalue,jQ.dataGridCore.editOptions.bClose);}
									else {jQ.dataGridCore.infoBox(jQ.dataGridCore.messages.errorTitle,e.message,jQ.dataGridCore.editOptions.bClose);}
								}
								return true;
							}
						});
					} else {
					switch (jQ(this).get(0).type) {
						case "checkbox":
							if(jQ(this).is(":checked")) {
								post_data_map[this.name]= jQ(this).get_value();
							}else {
								var off_value = jQ(this).attr("offval");
								post_data_map[this.name]= off_value;
							}
						break;
						case "select-one":
							post_data_map[this.name]= jQ("option:selected",this).get_value();
							extra_post_data[this.name]= jQ("option:selected",this).text();
						break;
						case "select-multiple":
							post_data_map[this.name]= jQ(this).get_value();
							if(post_data_map[this.name]) {post_data_map[this.name] = post_data_map[this.name].join(",");}
							else {post_data_map[this.name] ="";}
							var selected_display_text = [];
							jQ("option:selected",this).each_element(
								function(idx,selected_option){
									selected_display_text[idx] = jQ(selected_option).text();
								}
							);
							extra_post_data[this.name]= selected_display_text.join(",");
						break;
						case "password":
						case "text":
						case "textarea":
						case "button":
							post_data_map[this.name] = jQ(this).get_value();

						break;
					}
					if(grid_elem.p.autoencode) {post_data_map[this.name] = jQ.dataGridCore.encodeHtml(post_data_map[this.name]);}
					}
				});
				return true;
			}
			function generateFormFields(entry_identifier_val, grid_object, form_table_ref, max_cols_per_row){
				var field_name_val, hidden_col_flag, table_row_data, counter_val=0, temporary_value, display_class_style, element_control, return_positions_array=[], index_found_flag=false,
				cell_template_html = "<td class='CaptionColumn'>&#160;</td><td class='DataColumn'>&#160;</td>", combined_template_str="", loop_index; //*2
				for (loop_index =1; loop_index<=max_cols_per_row;loop_index++) {
					combined_template_str += cell_template_html;
				}
				if(entry_identifier_val != '_empty') {
					index_found_flag = jQ(grid_object).data_grid_api("get_item_index",entry_identifier_val);
				}
				jQ(grid_object.p.colModel).each( function(idx) {
					field_name_val = this.name;
					// hidden fields are included in the form
					if(this.editrules && this.editrules.edithidden === true) {
						hidden_col_flag = false;
					} else {
						hidden_col_flag = this.hidden === true ? true : false;
					}
					display_class_style = hidden_col_flag ? "style='display:none'" : "";
					if ( field_name_val !== 'cb' && field_name_val !== 'subgrid' && this.editable===true && field_name_val !== 'rn') {
						if(index_found_flag === false) {
							temporary_value = "";
						} else {
							if(field_name_val == grid_object.p.ExpandColumn && grid_object.p.treeGrid === true) {
								temporary_value = jQ("td:eq("+idx+")",grid_object.rows[index_found_flag]).text();
							} else {
								try {
									temporary_value =  jQ.dataGridCore.unformat_value(jQ("td:eq("+idx+")",grid_object.rows[index_found_flag]),{rowId:entry_identifier_val, colModel:this},idx);
								} catch (error_obj) {
									temporary_value =  (this.edittype && this.edittype == "textarea") ? jQ("td:eq("+idx+")",grid_object.rows[index_found_flag]).text() : jQ("td:eq("+idx+")",grid_object.rows[index_found_flag]).html();
								}
								if(!temporary_value || temporary_value == "&nbsp;" || temporary_value == "&#160;" || (temporary_value.length==1 && temporary_value.charCodeAt(0)==160) ) {temporary_value='';}
							}
						}
						var option_settings = jQ.extend({}, this.editoptions || {} ,{id:field_name_val,name:field_name_val}),
						form_option_settings = jQ.extend({}, {element_prefix:'',element_suffix:'',row_above:false,row_content:''}, this.formoptions || {}),
						row_position_val = parseInt(form_option_settings.rowpos,10) || counter_val+1,
						column_position_val = parseInt((parseInt(form_option_settings.colpos,10) || 1)*2,10);
						if(entry_identifier_val == "_empty" && option_settings.defaultValue ) {
							temporary_value = jQ.is_callable(option_settings.defaultValue) ? option_settings.defaultValue() : option_settings.defaultValue;
						}
						if(!this.edittype) {this.edittype = "text";}
						if(grid_elem.p.autoencode) {temporary_value = jQ.dataGridCore.decodeHtml(temporary_value);}
						element_control = jQ.dataGridCore.createElement(this.edittype,option_settings,temporary_value,false,jQ.extend({},jQ.dataGridCore.ajaxSettings,grid_object.p.ajaxSelectOptions || {}));
						if(temporary_value === "" && this.edittype == "checkbox") {temporary_value = jQ(element_control).attr("offval");}
						if(temporary_value === "" && this.edittype == "select") {temporary_value = jQ("option:eq(0)",element_control).text();}
						if(proc_data_edit[grid_elem.p.id].checkBeforeSubmit || proc_data_edit[grid_elem.p.id].checkOnFieldUpdate) {proc_data_edit[grid_elem.p.id]._cachedData[field_name_val] = temporary_value;}
						jQ(element_control).addClass("FormInputControl");
						if(this.edittype == 'text' || this.edittype == 'textarea') {
							jQ(element_control).addClass("ui-widget-content ui-corner-all");
						}
						table_row_data = jQ(form_table_ref).find("tr[rowpos="+row_position_val+"]");
						if(form_option_settings.row_above) {
							var new_row_data = jQ("<tr><td class='informationContent' colspan='"+(max_cols_per_row*2)+"'>"+form_option_settings.row_content+"</td></tr>");
							jQ(form_table_ref).append(new_row_data);
							new_row_data[0].rp = row_position_val;
						}
						if ( table_row_data.length===0 ) {
							table_row_data = jQ("<tr "+display_class_style+" rowpos='"+row_position_val+"'></tr>").addClass("FormDataRow").attr("id","row_"+field_name_val);
							jQ(table_row_data).append(combined_template_str);
							jQ(form_table_ref).append(table_row_data);
							table_row_data[0].rp = row_position_val;
						}
						jQ("td:eq("+(column_position_val-2)+")",table_row_data[0]).html( typeof form_option_settings.label === 'undefined' ? grid_object.p.colNames[idx]: form_option_settings.label);
						jQ("td:eq("+(column_position_val-1)+")",table_row_data[0]).append(form_option_settings.element_prefix).append(element_control).append(form_option_settings.element_suffix);
						return_positions_array[counter_val] = idx;
						counter_val++;
					}
				});
				if( counter_val > 0) {
					var id_row_entry = jQ("<tr class='FormDataRow' style='display:none'><td class='CaptionColumn'></td><td colspan='"+ (max_cols_per_row*2-1)+"' class='DataColumn'><input class='FormInputControl' id='id_entry_grid' type='text' name='"+grid_object.p.id+"_id' value='"+entry_identifier_val+"'/></td></tr>");
					id_row_entry[0].rp = counter_val+999;
					jQ(form_table_ref).append(id_row_entry);
					if(proc_data_edit[grid_elem.p.id].checkBeforeSubmit || proc_data_edit[grid_elem.p.id].checkOnFieldUpdate) {proc_data_edit[grid_elem.p.id]._cachedData[grid_object.p.id+"_id"] = entry_identifier_val;}
				}
				return return_positions_array;
			}
			function populateFormFields(entry_identifier_val, grid_object, form_id_val){
				var field_name_val, counter_val=0, temporary_value, form_field_element, option_settings, value_content, value_lowercase_content;
				if(proc_data_edit[grid_elem.p.id].checkBeforeSubmit || proc_data_edit[grid_elem.p.id].checkOnFieldUpdate) {proc_data_edit[grid_elem.p.id]._cachedData = {};proc_data_edit[grid_elem.p.id]._cachedData[grid_object.p.id+"_id"]=entry_identifier_val;}
				var col_model_array = grid_object.p.colModel;
				if(entry_identifier_val == '_empty') {
					jQ(col_model_array).each(function(idx){
						field_name_val = this.name;
						option_settings = jQ.extend({}, this.editoptions || {} );
						form_field_element = jQ("#"+jQ.dataGridCore.escapeId(field_name_val),"#"+form_id_val);
						if(form_field_element && form_field_element.length && form_field_element[0] !== null) {
							value_content = "";
							if(option_settings.defaultValue ) {
								value_content = jQ.is_callable(option_settings.defaultValue) ? option_settings.defaultValue() : option_settings.defaultValue;
								if(form_field_element[0].type=='checkbox') {
									value_lowercase_content = value_content.toLowerCase();
									if(value_lowercase_content.search(/(false|0|no|off|undefined)/i)<0 && value_lowercase_content!=="") {
										form_field_element[0].checked = true;
										form_field_element[0].defaultChecked = true;
										form_field_element[0].value = value_content;
									} else {
										form_field_element[0].checked = false;
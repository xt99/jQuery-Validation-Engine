/*
 * Inline Form Validation Engine 1.7.3, jQuery plugin
 *
 * Copyright(c) 2010, Cedric Dugas
 * http://www.position-absolute.com
 *
 * Form validation engine allowing custom regex rules to be added.
 * Thanks to Francois Duquette and Teddy Limousin
 * and everyone helping me find bugs on the forum
 * Licenced under the MIT Licence
 */
(function($) {

	var methods = {

		init : function(options) {

			var form = this;
			if (form.data('jqv') === undefined) {
				methods._saveOptions(form, options);

				// bind all formError elements to close on click
				$(".formError").live("click", function() {
					$(this).fadeOut(150, function() {

						// remove prompt once invisible
						$(this).remove();
					});
				});
			}
		},

		attach : function() {
			var form = this;
			var options = form.data('jqv');
			if (!options.binded) {

				// bind fields
				form.find("[class*=validate]").not("[type=checkbox]").bind(options.validationEventTriggers,
						methods._onFieldEvent);
				form.find("[class*=validate][type=checkbox]").bind("click", methods._onFieldEvent);

				// bind form.submit
				form.bind("submit", methods._onSubmitEvent);
				options.binded = true;
			}

		},

		detach : function() {
			var form = this;
			var options = f.data('jqv');
			if (options.binded) {
				// unbind fields
				form.find("[class*=validate]").not("[type=checkbox]").unbind(options.validationEventTriggers,
						methods._onFieldEvent);
				form.find("[class*=validate][type=checkbox]").unbind("click", methods._onFieldEvent);

				// unbind form.submit
				form.unbind("submit", methods._onSubmitEvent);
				form.removeData('jqv');
			}
		},

		/**
		 * Validates the form, shows prompts accordingly
		 * 
		 * @return true if the form validates
		 */
		validate : function() {
			return methods._validateForm($(this));
		},

		/**
		 * Closes all error prompts
		 */
		closePrompts : function() {
			$('.formError').fadeTo("fast", 0.3, function() {
				$(this).remove();
			});
		},

		/**
		 * Called when user exists a field, typically triggers a field
		 * validation
		 */
		_onFieldEvent : function() {
			var form = $(this).closest('form');
			var options = form.data('jqv');
			// validate the current field
			methods._validateField(form, options);
		},

		/**
		 * Called when the form is submited, shows prompts accordingly
		 * 
		 * @param {jqObject}
		 *            form
		 * @return false if form submission needs to be cancelled
		 */
		_onSubmitEvent : function() {

			var form=$(this);
			if (methods._validateForm(form) === false) {
				// if the form is invalid, give control to the callback method
				// and prevent the form submission
				//orefalo: bug undefined
				var options = form.data('jqv');
				options.onFailure();
				return false;
			}
		},

		/**
		 * Validates form, shows prompts accordingly
		 * 
		 * @param {jqObject}
		 *            form
		 * @return true if form is valid
		 */
		_validateForm : function(form) {

			var options = form.data('jqv');

			// this variable is set to true if an error is found
			var errorFound = false;
			var ajaxValid = true;

			// evaluate status of each non ajax fields
			form.find("[class*=validate]").each(function() {
				var field = $(this);
				// fields being valiated though ajax are marked with 'ajaxed',
				// skip them
				if (!field.hasClass("ajaxed"))
					errorFound = errorFound || methods._validateField(field, options);
			});

			// Check to see if all ajax calls completed
			var ajaxErrorLength = options.ajaxValidArray.length;
			for ( var x = 0; x < ajaxErrorLength; x++) {
				if (options.ajaxValidArray[x][1] === false) {
					ajaxValid = false;
					break;
				}
			}

			// if an error was raised, scroll the container
			if (errorFound || !ajaxValid) {
				if (options.scroll) {
					if (!options.containerOverflow) {

						// get the position of the first error
						var destination = $(".formError:not('.greenPopup'):first").offset().top;
						$(".formError:not('.greenPopup')").each(function() {
							var testDestination = $(this).offset().top;
							if (destination > testDestination)
								destination = $(this).offset().top;
						});
						$("html:not(:animated),body:not(:animated)").animate({
							scrollTop : destination
						}, 1100);
					} else {
						// orefalo: debug, search in the form
						var destination = $(".formError:not('.greenPopup'):first").offset().top;
						var scrollContainerScroll = $(options.containerOverflowDOM).scrollTop();
						var scrollContainerPos = -parseInt($(options.containerOverflowDOM).offset().top);

						destination += scrollContainerScroll + scrollContainerPos - 5;
						var scrollContainer = options.containerOverflowDOM + ":not(:animated)";

						$(scrollContainer).animate({
							scrollTop : destination
						}, 1100);
					}
				}
				return false;
			}
			return true;

		},
		/**
		 * Validates field, shows prompts accordingly
		 * 
		 * @param {jqObject}
		 *            field
		 * @return true if field is valid
		 */
		_validateField : function(field, options) {

			var rulesParsing = field.attr('class');
			var getRules = /\[(.*)\]/.exec(rulesParsing);
			if (getRules === null)
				return false;
			var str = getRules[1];
			var rules = str.split(/\[|,|\]/);
			return methods._validateRules(field, rules, options);

		},

		/**
		 * Validates field against the given rules, shows prompts accordingly
		 * 
		 * @param {jqObject}
		 *            field
		 * @return true if field is valid
		 */
		_validateRules : function(field, rules, options) {

			var promptText = "";

			if (!field.attr("id"))
				$.error("jQueryValidate: an ID attribute is required for this field: " + field.attr("name") + " class:"
						+ field.attr("class"));

			
			var ajaxValidate = false;
	

			// orefalo: this should be moved to the default settings
			options.isError = false;
			options.showTriangle = true;

			for ( var i = 0; i < rules.length; i++) {

				var errorMsg = undefined;
				switch (rules[i]) {
				
				// orefalo: review do we need this case ?
				case "optional":
					if (!field.val()) {
						methods._closePrompt(field);
						return options.isError;
					}
					break;
				case "required":
					errorMsg=methods._required(field, rules, i, options);
					break;
				case "custom":
					errorMsg=methods._customRegex(field, rules, i, options);
					break;
				// orefalo: review do we need this case ?
				case "exemptString":
					errorMsg=methods._exemptString(field, rules, i, options);
					break;
				case "ajax":
					// ajax has its own prompts handling technique
					if (!options.onSubmitValid)
						methods._ajax(field, rules, i, options);
					break;
				case "length":
					errorMsg=methods._length(field, rules, i, options);
					break;
				case "maxCheckbox":
					errorMsg=methods._maxCheckbox(field, rules, i, options);
					var groupname = field.attr("name");
					// orefalo a revoir
					caller = $("input[name='" + groupname + "']");
					break;
				case "minCheckbox":
					errorMsg=methods._minCheckbox(field, rules, i, options);
					var groupname = field.attr("name");
					// orefalo a revoir
					caller = $("input[name='" + groupname + "']");
					break;
				case "equals":
					errorMsg=methods._equals(field, rules, i, options);
					break;
				case "funcCall":
					errorMsg=methods._funcCall(field, rules, i, options);
					break;
				default:
					//$.error("jQueryValidator rule not found"+rules[i]);
				}
				
				if(errorMsg !== undefined) {
					promptText += errorMsg + "<br/>";
					options.isError = true;
				}

			}
			// Hack for radio/checkbox group button, the validation go into the
			// first radio/checkbox of the group
			var fieldType = field.attr("type");
			var fieldName = field.attr("name");
			if ((fieldType == "radio" || fieldType == "checkbox") && $("input[name='" + fieldName + "']").size() > 1) {
				caller = $("input[name='" + callerName + "'][type!=hidden]:first");
				options.showTriangle = false;
			}

			if (options.isError === true) {
				var prompt = methods._getPrompt(field);
				if (prompt)
					methods._updatePrompt(field, promptText,"",false, options);
				else
					methods._buildPrompt(field, promptText,"",false, options);
			} else
				methods._closePrompt(field);

			return options.isError;
		},

	
			/**
			 * Required validation
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			 _required: function(field, rules, i, options) {
				
				switch (field.attr("type")) {
				case "text":
				case "password":
				case "textarea":
					if (!field.val()) {
						return options.allrules[rules[i]].alertText;
					}
					break;
				case "radio":
				case "checkbox":
					var name = obj.attr("name");

					if ($("input[name='" + name + "']:checked").size() === 0) {
						
						if ($("input[name='" + name + "']").size() === 1) {
							return options.allrules[rules[i]].alertTextCheckboxe;
						} else {
							return options.allrules[rules[i]].alertTextCheckboxMultiple;
						}
					}
					break;
				case "select-one":
					// added by paul@kinetek.net for select boxes, Thank you
					if (!field.val()) {
						return options.allrules[rules[i]].alertText;
					}
					break;
				case "select-multiple":
					// added by paul@kinetek.net for select boxes, Thank you
					if (!field.find("option:selected").val()) {
						return options.allrules[rules[i]].alertText;
					}
					break;
				}
			},
			
			/**
			 * Validate Regex rules
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			_customRegex: function(field, rules, i, options) {
				var customRule = rules[i + 1];
				var pattern = new RegExp(options.allrules[customRule].regex);

				// orefalo todo: field.val()
				if (!pattern.test(field.attr('value'))) {	
					return options.allrules[customRule].alertText;
				}
			},
			/**
			 * Validate exempt
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			 _exemptString:function(field, rules, i, options) {
				var customString = rules[i + 1];
				if (field.attr('value') == customString ) {
					return options.allrules.required.alertText;
				}
			},
			
			/**
			 * Validate custom function outside of the engine scope
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			_funcCall:function (field, rules, i, options){
				var customRule = rules[i + 1];
				var funce = options.allrules[customRule].name;
				
				var fn = window[funce];
				if (typeof(fn) === 'function') {
					var fn_result = fn(field, rules, i);
					if (fn_result !== undefined ) {
						return fn_result;
					}
				}
			},
				
			/**
			 * Field match
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			_equals:	function (field, rules, i, options){
					var equalsField = rules[i + 1];
					
					if (field.attr('value') != $("#" + equalsField).attr('value')) {
						return options.allrules["equals"].alertText;
					}
				},
								/**
			 * Field length
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			_length:	function (field, rules, i, options){
					var startLength = rules[i + 1];
					var endLength = rules[i + 2];
					var len = field.attr('value').length;
					
					if (len < startLength || len > endLength) {
						var rule=options.allrules["length"];
						return rule.alertText + startLength +
						rule.alertText2 + endLength + rule.alertText3;
					}
				},
				
				/**
			 * Max number of checkbox selected
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			_maxCheckbox:	function (field, rules, i, options){
				
					var nbCheck = eval(rules[i + 1]);
					var groupname = field.attr("name");
					// orefalo:fix bug, look in the current form
					var groupSize = $("input[name='" + groupname + "']:checked").size();
					if (groupSize > nbCheck) {
						options.showTriangle = false;
						return options.allrules.maxCheckbox.alertText;
					}
				},
						/**
			 * Min number of checkbox selected
			 *
			 * @param {jqObject} field
			 * @param {Array[String]} rules
			 * @param {int} i
			 * @return an error string if validation failed
			 */
			_minCheckbox:	function (field, rules, i, options){
				
					var nbCheck = eval(rules[i + 1]);
					var groupname = $(field).attr("name");
					var groupSize = $("input[name='" + groupname + "']:checked").size();
					if (groupSize < nbCheck) {
						options.showTriangle = false;
						return options.allrules.minCheckbox.alertText + " " + nbCheck + " " +
						options.allrules.minCheckbox.alertText2;
					}
				},
				
				/**
				 * Validate AJAX rules
				 * 
				 * @param {Object} caller
				 * @param {Object} rules
				 * @param {Object} position
				 * @return NOT SURE an error string if validation failed
				 */
			_ajax:	function (field, rules, i, options){
				
					// orefalo: review variable scope
					var customAjaxRule = rules[i + 1];
					var posturl = options.allrules[customAjaxRule].file;
					//var fieldValue = field.val();
					//var ajaxCaller = field;
					//var fieldId = field.attr("id");
					var ajaxValidate = true;
					var ajaxisError = option.isError;
					
					if (options.allrules[customAjaxRule].extraData) {
						extraData = options.allrules[customAjaxRule].extraData;
					}
					else {
						extraData = "";
					}

					if (!ajaxisError) {
						$.ajax({
							type: "POST",
							url: posturl,
							cache: false,
							data: "validateValue=" + fieldValue + "&validateId=" + fieldId + "&validateError=" +
							customAjaxRule +"&extraData=" +	extraData,
							beforeSend: function(){
							
								// BUILD A LOADING PROMPT IF LOAD TEXT EXIST
								var loadingText = options.allrules[customAjaxRule].alertTextLoad;
								if (loadingText) {
									var prompt=methods._getPrompt(field);
									if(prompt)
										methods._updatePrompt(field,promptText, "load", true, options);
									else
										methods._buildPrompt(field,promptText, "load", true, options);
								}
							},
							error: function(data, transport){
								$.error("ajax error: " + data.status + " " + transport);
							},
							success: function(data){
								// GET SUCCESS DATA RETURN JSON
								data = eval("(" + data + ")");
								
								// GET JSON DATA FROM PHP AND PARSE IT
								ajaxCaller = $("#" + data.jsonValidateReturn[0])[0];
								customAjaxRule = data.jsonValidateReturn[1];
								ajaxisError = data.jsonValidateReturn[2];
								var fieldId = ajaxCaller;
								var existInarray;
								
								// DATA FALSE UPDATE PROMPT WITH ERROR;
								if (ajaxisError == "false") {
								
									// Check if ajax validation already used
									// on this field
									existInarray = _checkInArray(fieldId, false);
									
									// Simulate an ajax error to stop submit
									if (!existInarray) {
										var len = $.validationEngine.ajaxValidArray.length;
										$.validationEngine.ajaxValidArray[len] = new Array(2);
										$.validationEngine.ajaxValidArray[len][0] = fieldId;
										$.validationEngine.ajaxValidArray[len][1] = false;
										existInarray = false;
									}
									
									$.validationEngine.ajaxValid = false;
									promptText += options.allrules[customAjaxRule].alertText;
									$.validationEngine.updatePromptText(ajaxCaller, promptText, "", true);
								}
								else {
								
									existInarray = _checkInArray(fieldId, true);
									$.validationEngine.ajaxValid = true;
									if (!customAjaxRule) {
										$.error("wrong ajax response, are you on a server or in xampp? if not delete de ajax[ajaxUser] validating rule from your form ");
									}
									// NO OK TEXT MEANs CLOSE PROMPT
									if (options.allrules[customAjaxRule].alertTextOk) {
										$.validationEngine.updatePromptText(ajaxCaller, options.allrules[customAjaxRule].alertTextOk, "pass", true);
									}
									else {
										ajaxValidate = false;
										$.validationEngine.closePrompt(ajaxCaller);
									}
								}
								function _checkInArray(fieldId, validate){
									var array = $.validationEngine.ajaxValidArray;
									for (var x = 0; x < array.length; x++) {
										if (array[x][0] == fieldId) {
											array[x][1] = validate;
											return true;
										}
									}
									return false;
								}
							}
						});
					}
				},

		/**
		 * Builds a prompt for the given field
		 * 
		 * @param {jqObject}
		 *            field
		 */
		_buildPrompt : function(field, promptText, type, ajaxed, options) {

			// discard prompt if already there
			var prompt = methods._getPrompt(field);
			if (prompt) {
				prompt.stop();
				prompt.remove();
			}

			// create the prompt
			prompt = $('<div>');
			prompt.addClass(field.attr("id") + "formError");
			prompt.addClass("formError");
			
			
			switch (type) {
			case "pass":
				prompt.addClass("greenPopup");
				break;
			case "load":
				prompt.addClass("blackPopup");
			}
			if (ajaxed)
				prompt.addClass("ajaxed");

			// create the prompt content
			var promptContent = $('<div>').addClass("formErrorContent").html(promptText).appendTo(prompt);
			//prompt.append(promptContent);

			if (!options) {
				// get the options if they were not passed as parameters
				var form = field.closest('form');
				options = form.data('jqv');
			}

			// create the css arrow pointing at the field
			// note that there is no triangle on max-checkbox and radio
			if (options.showTriangle) {
				var arrow = $('<div>').addClass("formErrorArrow");
				
				switch (options.promptPosition) {
				case "bottomLeft":
				case "bottomRight":
					arrow.addClass("formErrorArrowBottom").html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
					break;
				case "topLeft":
				case "topRight":
					arrow.html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
					break;
				}
				prompt.append(arrow);
			}

			var pos = methods._calculatePosition(field, prompt, options);
			prompt.css({
				"top" : pos.callerTopPosition,
				"left" : pos.callerleftPosition,
				"marginTop" : pos.marginTopSize,
				"opacity" : 0
			});

			// Inser prompt in the form or in the overflown container?
			// orefalo: is this really required.. test it
			if (options.containerOverflow)
				field.before(prompt.get());
			else
				$("body").append(prompt.get());

			return prompt.animate({
				"opacity" : 0.87
			});
			
		},

		/**
		 * Updates the prompt text field - the field for which the prompt
		 * applies promptText - html text to display type - the type of bubble:
		 * 'pass' (green), 'load' (green) ajaxted - if true options - the form
		 * options (optional) - which be resolved if not present
		 */
		//orefalo:rename this method updatePrompt
		_updatePrompt : function(field, promptText, type, ajaxed, options) {

			var prompt = methods._getPrompt(field);
			if (prompt) {
				if (type == "pass")
					prompt.addClass("greenPopup");
				else
					prompt.removeClass("greenPopup");

				if (type == "load")
					prompt.addClass("blackPopup");
				else
					prompt.removeClass("blackPopup");

				if (ajaxed)
					prompt.addClass("ajaxed");
				else
					prompt.removeClass("ajaxed");

				prompt.find(".formErrorContent").html(promptText);

				var pos = methods._calculatePosition(field, prompt, options);
				prompt.animate({
					"top" : pos.callerTopPosition,
					"marginTop" : pos.marginTopSize
				});
			}
		},

		/**
		 * Closes the prompt associated with the given field
		 * 
		 * @param {jqObject}
		 *            field
		 */
		_closePrompt : function(field) {
			var prompt = methods._getPrompt(field);
			if (prompt)
				prompt.fadeTo("fast", 0, function() { prompt.remove(); });
		},

		/**
		 * Returns the error prompt matching the field if any
		 * 
		 * @param {jqObject}
		 *            field
		 * @return undefined or error prompt jquery object
		 */
		_getPrompt : function(field) {

			var className = field.attr("id") + "formError";
			// remove any [ or ] caracters, which migh be used with minCheckbox
			// validations
			className = className.replace(/\[/g, "").replace(/\]/g, "");
			var match=$(className)[0];
			if (match)
				return $(match);
		},

		/**
		 * Calculates prompt position
		 * 
		 * @param {jqObject}
		 *            field
		 * @param {jqObject}
		 *            promptElmt
		 * @param {Map}
		 *            options
		 * @return positions
		 */
		_calculatePosition : function(field, promptElmt, options) {

			var callerTopPosition, callerleftPosition, marginTopSize;
			var callerWidth = field.width();
			var inputHeight = promptElmt.height();

			if (!options) {
				$.error("NO OPTIONS!");
			}

			var overflow = options.containerOverflow;
			if (overflow) {
				// Is the form contained in an overflown container?
				callerTopPosition = callerleftPosition = 0;
				// compasation for the triangle
				marginTopSize = -inputHeight;
			} else {
				var offset = field.offset();
				callerTopPosition = offset.top;
				callerleftPosition = offset.left;
				marginTopSize = 0;
			}

			switch (options.promptPosition) {

			default:
			case "topRight":
				if (overflow)
					// Is the form contained in an overflown container?
					callerleftPosition += callerWidth - 30;
				else {
					callerleftPosition += callerWidth - 30;
					callerTopPosition += -inputHeight;
				}	
				break;
			case "topLeft":
				callerTopPosition += -inputHeight - 10;
				break;
			case "centerRight":
				callerleftPosition += callerWidth + 13;
				break;
			case "bottomLeft":
				callerTopPosition = callerTopPosition + field.height() + 15;
				break;
			case "bottomRight":
				callerleftPosition += callerWidth - 30;
				callerTopPosition += field.height() + 5;
			}

			return {
				"callerTopPosition" : callerTopPosition + "px",
				"callerleftPosition" : callerleftPosition + "px",
				"marginTopSize" : marginTopSize + "px"
			};
		},

		/***********************************************************************
		 * Saves the user options and variables in the form.data
		 * 
		 * @param {jqObject}
		 *            form - the form where the user option should be saved
		 * @param {Map}
		 *            options - the user options
		 * @return the user options (extended from the defaults)
		 */
		_saveOptions : function(form, options) {

			// is there a language localisation ?
			if ($.validationEngineLanguage)
				var allRules = $.validationEngineLanguage.allRules;
			else
				$.error("jQuery.validationEngine rules are not loaded, plz add localization files to the page");

			var userOptions = $.extend({

				// orefalo: rename the variable name, it should b singular
				validationEventTriggers : "focusout",

				// Automatically scroll viewport to the first error
				scroll : true,
				// Opening box position, possible locations are: topLeft,
				// topRight, bottomLeft, centerRight, bottomRight
				promptPosition : "topRight",
				// callback method when the validation fails
				onFailure : $.noop,

				// used when the form is displayed within a frame
				containerOverflow : false,
				containerOverflowDOM : "",

				// --- Internals DO NOT TOUCH or OVERLOAD ---
				success : false,
				allrules : allRules,
				ajaxSubmit : false,
				ajaxValidArray : [],
				ajaxValid : true,
				// true when for and fields are binded
				binded : false,
				// orefalo: rename showPromptArrow
				showTriangle : true,
				isError : false,
				onSubmitValid : true

			}, options);

			form.data('jqv', userOptions);
			return userOptions;
		}

	};

	/***
	 * Plugin entry point
	 * 
	 * @param {String}
	 *            method (optional) action
	 */
	$.fn.validationEngine = function(method) {

		var form = $(this);
		// skip _methods
		if (method && method.charAt(0) != '_' && methods[method]) {
			// make sure init is being called at least once
			methods.init.apply(form);
			return methods[method].apply(form, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(form, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.validationEngine');
		}
	};

})(jQuery);

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
(function($){

    var methods = {
    
        init: function(options){
        
            var form = this;
            if (form.data('jqv') == undefined) {
                methods._saveOptions(form, options);
                
                // bind all formError elements to close on click
                $(".formError").live("click", function(){
                    $(this).fadeOut(150, function(){
                    
                        // remove prompt once invisible
                        $(this).remove();
                    });
                });
            }
        },
        
        attach: function(){
            var form = this;
            
            var options = form.data('jqv');
            if (!options.binded) {
            
                // bind fields
                form.find("[class*=validate]").not("[type=checkbox]").bind(options.validationEventTriggers, methods._onFieldEvent);
                form.find("[class*=validate][type=checkbox]").bind("click", methods._onFieldEvent);
                
                // bind form.submit
                form.bind("submit", methods._onSubmitEvent);
                options.binded = true;
            }
            
        },
        
        detach: function(){
            var form = this;
            var options = f.data('jqv');
            if (options.binded) {
                // unbind fields
                form.find("[class*=validate]").not("[type=checkbox]").unbind(options.validationEventTriggers, methods._onFieldEvent);
                form.find("[class*=validate][type=checkbox]").unbind("click", methods._onFieldEvent);
                
                // unbind form.submit
                form.unbind("submit", methods._onSubmitEvent);
                form.removeData('jqv');
            }
        },
        
        
        /**
         * Validates the form, shows prompts accordingly
         * @returns true if the form validates
         */
        validate: function(){
            return methods._validateForm(this);
        },
        
        /**
         * Closes all error prompts
         */
        closePrompts: function(){
            $('.formError').fadeTo("fast", 0.3, function(){
                $(this).remove();
            });
        },
        
        /**
         * Called when user exists a field, typically triggers a field validation
         */
        _onFieldEvent: function(){
            // validate the current field
            methods._validateField($(this));
        },
        
        
        /**
         * Called when the form is submited, shows prompts accordingly
         * @param {jqObject} form
         * @returns false if form submission needs to be cancelled
         */
        _onSubmitEvent: function(form){
        
            if (methods.validate() === false) {
                // if the form is invalid, give control to the callback method and prevent the form submission
                settings.onFailure();
                return false;
            }
        },
        
        /**
         * Validates form, shows prompts accordingly
         * @param {jqObject} form
         * @returns true if form is valid
         */
        _validateForm: function(form){
        
            var options = form.data('jqv');
            
            // this variable is set to true if an error is found
            var errorFound = false;
            var ajaxValid = true;
            
            // evaluate status of each non ajax fields
            obj.find("[class*=validate]").each(function(){
                var field = $(this);
				// fields being valiated though ajax are marked with 'ajaxed', skip them
                if (!field.hasClass("ajaxed")) 
                    errorFound |= _methods.validateField(field);
            });
            
            // Check to see if all ajax calls completed
            var ajaxErrorLength = options.ajaxValidArray.length;
            for (var x = 0; x < ajaxErrorLength; x++) {
                if (options.ajaxValidArray[x][1] == false) {
					ajaxValid = false;
					break;
				}
            }
            
            // if an error was raised, scroll the container
            if (errorFound || !ajaxValid) {
                if (options.scroll) {
                    if (!options.containerOverflow) {
                    
                        // get the position of the first error
                        var destination = $(".formError:not('.greenPopup'):first", form).offset().top;
                        $(".formError:not('.greenPopup')").each(function(){
                            var testDestination = $(this).offset().top;
                            if (destination > testDestination) 
                                destination = $(this).offset().top;
                        });
                        $("html:not(:animated),body:not(:animated)").animate({
                            scrollTop: destination
                        }, 1100);
                    }
                    else {
                        var destination = $(".formError:not('.greenPopup'):first", form).offset().top;
                        var scrollContainerScroll = $(options.containerOverflowDOM).scrollTop();
                        var scrollContainerPos = -parseInt($(options.containerOverflowDOM).offset().top);
                        
                        destination += scrollContainerScroll + scrollContainerPos - 5;
                        var scrollContainer = options.containerOverflowDOM + ":not(:animated)";
                        
                        $(scrollContainer).animate({
                            scrollTop: destination
                        }, 1100);
                    }
                }
                return false;
            }
            return true;
            
            
        },
        /**
         * Validates field, shows prompts accordingly
         * @param {jqObject} field
         * @returns true if field is valid
         */
        _validateField: function(field, options){
        
            var rulesParsing = field.attr('class');
            var getRules = /\[(.*)\]/.exec(rulesParsing);
            if (getRules === null) 
                return false;
            var str = getRules[1];
            var inputRules = str.split(/\[|,|\]/);
            return methods._validateRules(field, inputRules, options);
            
        },
        
        
        /**
         * Validates field against the given rules, shows prompts accordingly
         * @param {jqObject} field
         * @returns true if field is valid
         */
        _validateRules: function(field, rules, options){
        
            var form = field.closest('form');        
			
			// because of the async nature of the ajax call, we need to use a global
			var promptText = "";

			if (!field.attr("id"))
				$.error("jQueryValidate: an ID attribute is required for this field: " + field.attr("name") + " class:"
						+ field.attr("class"));

			var ajaxValidate = false;
			var fieldName = field.attr("name");
			
			// orefalo: this should be moved to the default settings
			options.isError = false;
			options.showTriangle = true;

			for ( var i = 0; i < rules.length; i++) {
				switch (rules[i]) {
				case "optional":
					if (!field.val()) {
						methods._closePrompt(field);
						return options.isError;
					}
					break;
				case "required":
					_required(field, rules);
					break;
				case "custom":
					_customRegex(field, rules, i);
					break;
				case "exemptString":
					_exemptString(field, rules, i);
					break;
				case "ajax":
					if (!options.onSubmitValid)
						_ajax(field, rules, i);
					break;
				case "length":
					_length(field, rules, i);
					break;
				case "maxCheckbox":
					_maxCheckbox(field, rules, i);
					var groupname = field.attr("name");
					caller = $("input[name='" + groupname + "']");
					break;
				case "minCheckbox":
					_minCheckbox(field, rules, i);
					var groupname = field.attr("name");
					caller = $("input[name='" + groupname + "']");
					break;
				case "equals":
					_equals(field, rules, i);
					break;
				case "funcCall":
					_funcCall(field, rules, i);
					break;
				default:
				}
			}
			// Hack for radio/checkbox group button, the validation go into the first radio/checkbox of the group
			var fieldType = field.attr("type");
			if ((fieldType == "radio" || fieldType == "checkbox") && $("input[name='" + fieldName + "']").size() > 1 ) 
			{
				caller = $("input[name='" + callerName + "'][type!=hidden]:first");
				options.showTriangle = false;
			}

			if (options.isError === true) {
				var prompt = methods._getPrompt(field);
				if(prompt)
					 methods._updatePromptText(field, promptText);
				else
					 methods._buildPrompt(field, promptText);
			} else {
				methods._closePrompt(field);
			}		
			
        },
        
        
        /**
         * Builds a prompt for the given field
         * @param {jqObject} field
         */
        _buildPrompt: function(field, promptText, type, ajaxed, options){
        
            // discard prompt if already there
            var prompt = methods._getPrompt(field);
            if (prompt) {
                prompt.stop();
                prompt.remove();
            }
            
            // create the prompt
            prompt = $('<div/>').addClass("formError").addClass(field.attr("id") + "formError");
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
            var promptContent = $('<div/>');
            promptContent.addClass("formErrorContent");
            promptContent.html(promptText);
            prompt.append(promptContent);
            
            if (!options) {
                // get the options if they were not passed as parameters
                var form = field.closest('form');
                options = form.data('jqv');
            }
            
            // Inser prompt in the form or in the overflown container?
            if (options.containerOverflow) 
                field.before(prompt);
            else 
                $("body").append(prompt);
            
            // create the css arrow pointing at the field
            // note that there is no triangle on max-checkbox and radio
            if (options.showTriangle != false) {
                var arrow = $('<div/>');
                arrow.addClass("formErrorArrow");
                prompt.append(arrow);
                switch (options.promptPosition) {
                    case "bottomLeft":
                    case "bottomRight":
                        arrow.addClass("formErrorArrowBottom");
                        arrow.html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
                        break;
                    case "topLeft":
                    case "topRight":
                        prompt.append(arrow);
                        arrow.html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
                        break;
                }
            }
            
            var pos = methods._calculatePosition(field, prompt, options);
            prompt.css({
                "top": pos.callerTopPosition,
                "left": pos.callerleftPosition,
                "marginTop": pos.marginTopSize,
                "opacity": 0
            });
            
            return prompt.animate({
                "opacity": 0.87
            });
        },
        
        /**
         * Updates the prompt text
         * field - the field for which the prompt applies
         * promptText - html text to display
         * type - the type of bubble: 'pass' (green), 'load' (green)
         * ajaxted - if true
         * options - the form options (optional) - which be resolved if not present
         */
        _updatePromptText: function(field, promptText, type, ajaxed, options){
        
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
                    "top": pos.callerTopPosition,
                    "marginTop": pos.marginTopSize
                });
            }
        },
        
        /**
         * Closes the prompt associated with the given field
         * @param {jqObject} field
         */
        _closePrompt: function(field){
            var prompt = methods._getPrompt(field);
            if (prompt) {
                prompt.fadeTo("fast", 0, function(){
                    prompt.remove();
                });
            }
        },
        
        
        /**
         * Returns the error prompt matching the field if any
         * @param {jqObject} field
         * @returns undefined or error prompt jquery object
         */
        _getPrompt: function(field){
        
            var className = field.attr("id") + "formError";
            // remove any [ or ] caracters, which migh be used with minCheckbox validations
            className = className.replace(/\[/g, "").replace(/\]/g, "");
            return $("." + className);
        },
        
        
        /**
         * Calculates prompt position
         * @param {jqObject} field
         * @param {jqObject} promptElmt
         * @param {Map} options
         * @returns positions
         */
        _calculatePosition: function(field, promptElmt, options){
        
            var callerTopPosition, callerleftPosition, marginTopSize;
            var callerWidth = field.width();
            var inputHeight = promptElmt.height();
            
            if (!options) {
                // get the options if they were not passed as parameters
                var form = field.closest('form');
                options = form.data('jqv');
            }
            
            var overflow = options.containerOverflow;
            if (overflow) {
                // Is the form contained in an overflown container?
                callerTopPosition = callerleftPosition = 0;
                // compasation for the triangle
                marginTopSize = -inputHeight;
            }
            else {
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
                "callerTopPosition": callerTopPosition + "px",
                "callerleftPosition": callerleftPosition + "px",
                "marginTopSize": marginTopSize + "px"
            };
        },
        
        
        /***
         * Saves the user options and variables in the form.data
         * @param {jqObject} form - the form where the user option should be saved
         * @param {Map} options - the user options
         * @returns the user options (extended from the defaults)
         */
        _saveOptions: function(form, options){
        
            // is there a language localisation ?
            if ($.validationEngineLanguage) 
                var allRules = $.validationEngineLanguage.allRules;
            else 
                $.error("jQuery.validationEngine rules are not loaded, plz add localization files to the page");
            
            var userOptions = $.extend({
            
                // orefalo: rename the variable name, it should b singular
                validationEventTriggers: "focusout",
                
                // Automatically scroll viewport to the first error
                scroll: true,
                // Opening box position, possible locations are: topLeft, topRight, bottomLeft, centerRight, bottomRight
                promptPosition: "topRight",
                // callback method when the validation fails
                onFailure: $.noop(),
                
                // used when the form is displayed within a frame
                containerOverflow: false,
                containerOverflowDOM: "",
                
                // --- Internals DO NOT TOUCH or OVERLOAD ---
                success: false,
                allrules: allRules,
                ajaxSubmit: false,
                ajaxValidArray: [],
                ajaxValid: true,
                // true when for and fields are binded
                binded: false,
                // orefalo: rename showPromptArrow
                showTriangle: true,
				isError: false,
				onSubmitValid: true
            
            }, options);
            
            form.data('jqv', userOptions);
            return userOptions;
        }
        
    };
    
    /***
     * Plugin entry point
     * @param {String} method (optional) action
     */
    $.fn.validationEngine = function(method){
    
        var form = $(this);
        // skip _methods
        if (method && method.charAt(0) != '_' && methods[method]) {
            // make sure init is being called at least once
            methods.init.apply(form);
            return methods[method].apply(form, Array.prototype.slice.call(arguments, 1));
        }
        else 
            if (typeof method === 'object' || !method) {
                return methods.init.apply(form, arguments);
            }
            else {
                $.error('Method ' + method + ' does not exist on jQuery.validationEngine');
            }
    };
    
})(jQuery);

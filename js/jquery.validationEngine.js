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
    
        /**
         * Kind of the constructor, called before any action
         * @param {Map} user options
         */
        init: function(options){
        
            var form = this;
            if (form.data('jqv') === undefined) {
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
        
        /**
         * Attachs jQuery.validationEngine to form.submit and field.blur
         */
        attach: function(){
            var form = this;
            var options = form.data('jqv');
            if (!options.binded) {
            
                // bind fields
                form.find("[class*=validate]").not("[type=checkbox]").bind(options.validationEventTrigger, methods._onFieldEvent);
                form.find("[class*=validate][type=checkbox]").bind("click", methods._onFieldEvent);
                
                // bind form.submit
                form.bind("submit", methods._onSubmitEvent);
                options.binded = true;
            }
            
        },
        
        /**
         * Unregisters any bindings that may point to jQuery.validaitonEngine
         */
        detach: function(){
            var form = this;
            var options = f.data('jqv');
            if (options.binded) {
                // unbind fields
                form.find("[class*=validate]").not("[type=checkbox]").unbind(options.validationEventTrigger, methods._onFieldEvent);
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
        validate: function(){
            return methods._validateForm(this);
        },
        
        /**
         * Displays a prompt on a element.
         * Note that the element needs an id!
         *
         * @param {String} promptText html text to display type
         * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
         */
        showPrompt: function(promptText, type){
        
            var form = this.closest('form');
            var options = form.data('jqv');
            methods._showPrompt(this, promptText, type, false, options);
        },
        
        /**
         * Closes form error prompts
         */
        hide: function(){
            var form = this;
            form.find('.formError').fadeTo("fast", 0.3, function(){
                $(this).remove();
            });
        },
        
        /**
         * Closes all error prompts on the page
         */
        hideAll: function(){
            $('.formError').fadeTo("fast", 0.3, function(){
                $(this).remove();
            });
        },
        
        /**
         * Called when user exists a field, typically triggers a field
         * validation
         */
        _onFieldEvent: function(){
            var field = $(this);
            var form = field.closest('form');
            var options = form.data('jqv');
            // validate the current field
            methods._validateField(field, options);
        },
        
        /**
         * Called when the form is submited, shows prompts accordingly
         *
         * @param {jqObject}
         *            form
         * @return false if form submission needs to be cancelled
         */
        _onSubmitEvent: function(){
        
            var form = $(this);
            if (methods._validateForm(form) === false) {
                // if the form is invalid, give control to the callback method
                // and prevent the form submission
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
        _validateForm: function(form){
        
            var options = form.data('jqv');
            
            // this variable is set to true if an error is found
            var errorFound = false;
            var ajaxValid = true;
            
            // evaluate status of each non ajax fields
            form.find("[class*=validate]").each(function(){
                var field = $(this);
                // fields being valiated though ajax are marked with 'ajaxed',
                // skip them
                if (!field.hasClass("ajaxed")) 
                    errorFound |= methods._validateField(field, options);
            });
            
            // Check to see if all ajax calls completed
            var ajaxErrorLength = options.ajaxValidArray.length;
            for (var x = 0; x < ajaxErrorLength; x++) {
                if (options.ajaxValidArray[x][1] === false) {
                    ajaxValid = false;
                    break;
                }
            }
            
            // If an error was raised, scroll the container
            if (errorFound || !ajaxValid) {
                if (options.scroll) {
                
                    // get the position of the first error, there should be at least one, no need to check fro undefined
                    //var destination = form.find(".formError:not('.greenPopup'):first").offset().top;
                    
                    // look for the visually top prompt
					var destination = Number.MAX_VALUE;
                    
                    var lst = form.find(".formError:not('.greenPopup')");
                    for (var i = 0; i < lst.length; i++) {
                        var d = $(lst[i]).offset().top;
                        if (d < destination) 
                            destination = d;
                    }
                    
                    if (!options.isOverflown)
                        $("html:not(:animated),body:not(:animated)").animate({
                            scrollTop: destination
                        }, 1100);
                    else {
                        var overflowDIV = $(options.overflownDIV);
                        var scrollContainerScroll = overflowDIV.scrollTop();
                        var scrollContainerPos = -parseInt(overflowDIV.offset().top);
                        
                        //destination += scrollContainerScroll + scrollContainerPos - 5;
                        var scrollContainer = $(options.overflownDIV + ":not(:animated)");
                        
                        scrollContainer.animate({
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
         *
         * @param {jqObject}
         *            field
         * @param {Map}
         *            user options
         * @return true if field is valid, false otehrwise
         */
        _validateField: function(field, options){
        
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
         * @param {Array[String]}
         *            field's validation rules
         * @param {Map}
         *            user options
         * @return true if field is valid
         */
        _validateRules: function(field, rules, options){
        
            if (!field.attr("id")) 
                $.error("jQueryValidate: an ID attribute is required for this field: " + field.attr("name") + " class:" +
                field.attr("class"));
            
            var ajaxValidate = false;
            
            // orefalo: review if we should store these variable in options
            options.isError = false;
            options.showArrow = true;
            var promptText = "";
            
            for (var i = 0; i < rules.length; i++) {
            
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
                        errorMsg = methods._required(field, rules, i, options);
                        break;
                    case "custom":
                        errorMsg = methods._customRegex(field, rules, i, options);
                        break;
                    case "ajax":
                        // ajax has its own prompts handling technique
                        methods._ajax(field, rules, i, options);
                        break;
                    case "length":
                        errorMsg = methods._length(field, rules, i, options);
                        break;
                    case "maxCheckbox":
                        errorMsg = methods._maxCheckbox(field, rules, i, options);
                        var groupname = field.attr("name");
                        // orefalo a revoir
                        caller = $("input[name='" + groupname + "']");
                        break;
                    case "minCheckbox":
                        errorMsg = methods._minCheckbox(field, rules, i, options);
                        var groupname = field.attr("name");
                        // orefalo a revoir
                        caller = $("input[name='" + groupname + "']");
                        break;
                    case "equals":
                        errorMsg = methods._equals(field, rules, i, options);
                        break;
                    case "funcCall":
                        errorMsg = methods._funcCall(field, rules, i, options);
                        break;
                    default:
                    //$.error("jQueryValidator rule not found"+rules[i]);
                }
                
                if (errorMsg !== undefined) {
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
                options.showArrow = false;
            }
            
            if (options.isError) 
                methods._showPrompt(field, promptText, "", false, options);
            else 
                methods._closePrompt(field);
            
            return options.isError;
        },
        
        
        /**
         * Required validation
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _required: function(field, rules, i, options){
        
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
                    var name = field.attr("name");
                    if ($("input[name='" + name + "']:checked").size() === 0) {
                    
                        if ($("input[name='" + name + "']").size() === 1) {
                            return options.allrules[rules[i]].alertTextCheckboxe;
                        }
                        else {
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
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _customRegex: function(field, rules, i, options){
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
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _exemptString: function(field, rules, i, options){
            var customString = rules[i + 1];
            if (field.attr('value') == customString) 
                return options.allrules.required.alertText;
        },
        
        /**
         * Validate custom function outside of the engine scope
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _funcCall: function(field, rules, i, options){
            var functionName = rules[i + 1];
            var fn = window[functionName];
            if (typeof(fn) === 'function') 
                return fn(field, rules, i, options);
            
        },
        
        /**
         * Field match
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _equals: function(field, rules, i, options){
            var equalsField = rules[i + 1];
            
            if (field.attr('value') != $("#" + equalsField).attr('value')) 
                return options.allrules["equals"].alertText;
        },
        /**
         * Field length
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _length: function(field, rules, i, options){
            var startLength = rules[i + 1];
            var endLength = rules[i + 2];
            var len = field.attr('value').length;
            
            if (len < startLength || len > endLength) {
                var rule = options.allrules["length"];
                return rule.alertText + startLength +
                rule.alertText2 +
                endLength +
                rule.alertText3;
            }
        },
        
        /**
         * Max number of checkbox selected
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _maxCheckbox: function(field, rules, i, options){
        
            var nbCheck = eval(rules[i + 1]);
            var groupname = field.attr("name");
            // orefalo:fix bug, look in the current form
            var groupSize = $("input[name='" + groupname + "']:checked").size();
            if (groupSize > nbCheck) {
                options.showArrow = false;
                return options.allrules.maxCheckbox.alertText;
            }
        },
        /**
         * Min number of checkbox selected
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return an error string if validation failed
         */
        _minCheckbox: function(field, rules, i, options){
        
            var nbCheck = eval(rules[i + 1]);
            var groupname = $(field).attr("name");
            var groupSize = $("input[name='" + groupname + "']:checked").size();
            if (groupSize < nbCheck) {
                options.showArrow = false;
                return options.allrules.minCheckbox.alertText + " " + nbCheck + " " +
                options.allrules.minCheckbox.alertText2;
            }
        },
        
        /**
         * Validate AJAX rules
         *
         * @param {jqObject} field
         * @param {Array[String]} rules
         * @param {int} i rules index
         * @param {Map}
         *            user options
         * @return nothing! the ajax validator handles the prompts itself
         */
        _ajax: function(field, rules, i, options){
        
            // orefalo: review variable scope
            var customAjaxRule = rules[i + 1];
            var posturl = options.allrules[customAjaxRule].file;
            //var fieldValue = field.val();
            //var ajaxCaller = field;
            //var fieldId = field.attr("id");
            var ajaxValidate = true;
            var ajaxisError = option.isError;
            
            var extraData = "";
            if (options.allrules[customAjaxRule].extraData) 
                extraData = options.allrules[customAjaxRule].extraData;
            
            if (!ajaxisError) {
                $.ajax({
                    type: "POST",
                    url: posturl,
                    cache: false,
                    data: "validateValue=" + fieldValue + "&validateId=" + fieldId + "&validateError=" +
                    customAjaxRule +
                    "&extraData=" +
                    extraData,
                    beforeSend: function(){
                    
                        // BUILD A LOADING PROMPT IF LOAD TEXT EXIST
                        var loadingText = options.allrules[customAjaxRule].alertTextLoad;
                        if (loadingText) 
                            methods._showPrompt(field, promptText, "load", true, options);
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
                                $.validationEngine._showPromptText(ajaxCaller, options.allrules[customAjaxRule].alertTextOk, "pass", true);
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
         * Builds or updates a prompt with the given information
         *
         * @param {jqObject} field
         * @param {String} promptText html text to display type
         * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
         * @param {boolean} ajaxed - use to mark fields than being validated with ajax
         * @param {Map} options user options
         */
        _showPrompt: function(field, promptText, type, ajaxed, options){
            var prompt = methods._getPrompt(field);
            if (prompt) 
                methods._updatePrompt(field, prompt, promptText, type, ajaxed, options);
            else 
                methods._buildPrompt(field, promptText, type, ajaxed, options);
        },
        
        /**
         * Builds and shades a prompt for the given field.
         *
         * @param {jqObject} field
         * @param {String} promptText html text to display type
         * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
         * @param {boolean} ajaxed - use to mark fields than being validated with ajax
         * @param {Map} options user options
         */
        _buildPrompt: function(field, promptText, type, ajaxed, options){
        
            // we don't need this test, if prompt is here, the code calls _updatePrompt
            // discard prompt if already there
            // var prompt = methods._getPrompt(field);
            //if (prompt) {
            //     prompt.stop();
            //     prompt.remove();
            // }
            
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
            
            // create the css arrow pointing at the field
            // note that there is no triangle on max-checkbox and radio
            if (options.showArrow) {
                var arrow = $('<div>').addClass("formErrorArrow");
                prompt.append(arrow);
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
            }
            
            // insert prompt in the form or in the overflown container?
            // orefalo: is this really required.. test it
            //if (options.isOverflown)
            field.before(prompt);
            //else
            //	$("body").append(prompt);
            
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
         * Updates the prompt text field - the field for which the prompt
         * @param {jqObject} field
         * @param {String} promptText html text to display type
         * @param {String} type the type of bubble: 'pass' (green), 'load' (black) anything else (red)
         * @param {boolean} ajaxed - use to mark fields than being validated with ajax
         * @param {Map} options user options
         */
        _updatePrompt: function(field, prompt, promptText, type, ajaxed, options){
        
            //var prompt = methods._getPrompt(field);
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
         *
         * @param {jqObject}
         *            field
         */
        _closePrompt: function(field){
            var prompt = methods._getPrompt(field);
            if (prompt) 
                prompt.fadeTo("fast", 0, function(){
                    prompt.remove();
                });
        },
        
        /**
         * Returns the error prompt matching the field if any
         *
         * @param {jqObject}
         *            field
         * @return undefined or error prompt jquery object
         */
        _getPrompt: function(field){
        
            var className = "." + field.attr("id") + "formError";
            // remove any [ or ] caracters, which migh be used with minCheckbox
            // validations
            className = className.replace(/\[/g, "").replace(/\]/g, "");
            var match = $(className)[0];
            if (match) 
                return $(match);
        },
        
        /**
         * Calculates prompt position
         *
         * @param {jqObject}
         *            field
         * @param {jqObject}
         *            the prompt
         * @param {Map}
         *            options
         * @return positions
         */
        _calculatePosition: function(field, promptElmt, options){
        
            var promptTopPosition, promptleftPosition, marginTopSize;
            var fieldWidth = field.width();
            var promptHeight = promptElmt.height();
            
            if (!options) {
                $.error("NO OPTIONS!");
            }
            
            var overflow = options.isOverflown;
            if (overflow) {
                // Is the form contained in an overflown container?
                promptTopPosition = promptleftPosition = 0;
                // compasation for the triangle
                marginTopSize = -promptHeight;
            }
            else {
                var offset = field.offset();
                promptTopPosition = offset.top;
                promptleftPosition = offset.left;
                marginTopSize = 0;
            }
            
            switch (options.promptPosition) {
            
                default:
                case "topRight":
                    if (overflow) 
                        // Is the form contained in an overflown container?
                        promptleftPosition += fieldWidth - 30;
                    else {
                        promptleftPosition += fieldWidth - 30;
                        promptTopPosition += -promptHeight;
                    }
                    break;
                case "topLeft":
                    promptTopPosition += -promptHeight - 10;
                    break;
                case "centerRight":
                    promptleftPosition += fieldWidth + 13;
                    break;
                case "bottomLeft":
                    promptTopPosition = promptTopPosition + field.height() + 15;
                    break;
                case "bottomRight":
                    promptleftPosition += fieldWidth - 30;
                    promptTopPosition += field.height() + 5;
            }
            
            return {
                "callerTopPosition": promptTopPosition + "px",
                "callerleftPosition": promptleftPosition + "px",
                "marginTopSize": marginTopSize + "px"
            };
        },
        
        /**
         * Saves the user options and variables in the form.data
         *
         * @param {jqObject}
         *            form - the form where the user option should be saved
         * @param {Map}
         *            options - the user options
         * @return the user options (extended from the defaults)
         */
        _saveOptions: function(form, options){
        
            // is there a language localisation ?
            if ($.validationEngineLanguage) 
                var allRules = $.validationEngineLanguage.allRules;
            else 
                $.error("jQuery.validationEngine rules are not loaded, plz add localization files to the page");
            
            var userOptions = $.extend({
            
                // Name of the event triggering field validation
                validationEventTrigger: "blur",
                // Automatically scroll viewport to the first error
                scroll: true,
                // Opening box position, possible locations are: topLeft,
                // topRight, bottomLeft, centerRight, bottomRight
                promptPosition: "topRight",
                // Callback method when the validation fails
                onFailure: $.noop,
                // Used when the form is displayed within a scrolling DIV
                isOverflown: false,
                overflownDIV: "",
                
                // --- Internals DO NOT TOUCH or OVERLOAD ---
                // validation rules and i18
                allrules: allRules,
                // true when form and fields are binded
                binded: false,
                // set to true, when the prompt arrow needs to be displayed
                showArrow: true,
                
                // orefalo: figure how these variables r used
                success: false,
                ajaxSubmit: false,
                ajaxValidArray: [],
                ajaxValid: true,
                isError: false
            }, options);
            
            form.data('jqv', userOptions);
            return userOptions;
        }
    };
    
    /**
     * Plugin entry point
     *
     * @param {String}
     *            method (optional) action
     */
    $.fn.validationEngine = function(method){
    
        var form = $(this);
        // skip _methods
        if (typeof(method) === 'string' && method.charAt(0) != '_' && methods[method]) {
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

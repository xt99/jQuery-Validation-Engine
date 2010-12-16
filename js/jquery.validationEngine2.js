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
        
			var form=this;
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
        
        // return true if form validates
        validate: function(){
			alert('validate');
            return true;
        },
        
		// closes all error prompts
		closePrompts : function() {
			$('.formError').fadeTo("fast", 0.3, function() {
					$(this).remove();
				});
		},
		
        // called when user exists a field
        _onFieldEvent: function(){
			alert( "_onFieldEvent " + this);
            // validate the current field
            methods._validateField($(this));
        },
        
        // calledwhen form is submited, shows prompts accordingly
        _onSubmitEvent: function(form){
			alert( "_onSubmitEvent " + this);
            if (methods.validate() === false) {
                // give control to the callback method, if defined
                settings.onFailure();
                // prevent the form submission
                return false;
            }
        },
        // returns true if field is valid, shows prompts accordingly
        _validateField: function(field){

			var rulesParsing = field.attr('class');
			var getRules = /\[(.*)\]/.exec(rulesParsing);
			if (getRules === null)
				return false;
			var str = getRules[1];
			var inputRules = str.split(/\[|,|\]/);
			return methods._validateRules(field, inputRules);

        },
		// returns true if field is valid against the given rules, shows prompts accordingly
 		_validateField: function(field, rules){

			var form=field.closest('form');
			var options = form.data('jqv');
			
			
			
			
		},
		
		// closes the prompt associated with the given field
		_closePrompt : function(field) {
			var prompt=methods._getPrompt(field);
			if (prompt) {
				prompt.fadeTo("fast", 0, function() {
					prompt.remove();
				});
			}
		},
		
		
        // returns the error prompt matching the field if any
		_getPrompt: function(field) {
		
			var className = field.attr("id") + "formError";
			// remove any [ or ] caracters, which migh be used with minCheckbox validations
			className = className.replace(/\[/g, "").replace(/\]/g, "");
			return $("."+className);
		},
		// saves the user options and variables in the form.data, returns the instance
        _saveOptions: function(form, options){
        
            // is there a language localisation ?
            if ($.validationEngineLanguage) 
                var allRules = $.validationEngineLanguage.allRules;
            else 
                $.error("Validation engine rules are not loaded, plz check the localization js is included in the page");
            
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
                // true when for and fields are binded
                binded: false
            
            }, options);
            
            form.data('jqv', userOptions);
            return userOptions;
        }
        
    };
    
    $.fn.validationEngine = function(method){
    
		var form=$(this);	
		// skip _methods
        if (method && method.charAt(0)!='_' && methods[method]) {
			// make sure init is being called at least once
			methods.init.apply(form);
			return methods[method].apply(form, Array.prototype.slice.call(arguments, 1));
        }
        else 
            if (typeof method === 'object' || !method) {
				//todo: ya un bug, il faut ahouter le form
				arguments.unshift(form);
                return methods.init.apply(form, arguments);
            }
            else {
                $.error('Method ' + method + ' does not exist on jQuery.validationEngine');
            }
    };
    
})(jQuery);

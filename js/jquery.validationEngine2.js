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
        
            if ($(this).data('jqv')) {
                methods._saveOptions(options);
                
                // bind all formError elements to close on click
                $(".formError").live("click", function(){
                    $(this).fadeOut(150, function(){
                        // remove prompt once invisible
                        $(this).remove();
                    });
                });
            }
        },
        
        attach: function(options){
            var f = $(this);
            
            var data = f.data('jqv');
            if (data && !data.binded) {
            
                var options = methods._saveOptions(options);
                
                // bind fields
                f.find("[class*=validate]").not("[type=checkbox]").bind(options.validationEventTriggers, methods._onTiggerEvent);
                f.find("[class*=validate][type=checkbox]").bind("click", methods._onTiggerEvent);
                
                // bind form.submit
                f.bind("submit", methods._onSubmitEvent);
                data.binded = true;
            }
            
        },
        
        detach: function(){
            var f = $(this);
            var data = f.data('jqv', userOptions);
            if (data.binded) {
                // unbind fields
                f.find("[class*=validate]").not("[type=checkbox]").unbind(options.validationEventTriggers, methods._onTiggerEvent);
                f.find("[class*=validate][type=checkbox]").unbind("click", methods._onTiggerEvent);
                
                // unbind form.submit
                f.unbind("submit", methods._onSubmitEvent);
                f.removeData('jqv');
            }
        },
        
        // return true if form validates
        validate: function(){
            return true;
        },
        
        // called when user exists a field
        _onTiggerEvent: function(){
            // validate the current field
            methods._validateField($(this));
        },
        
        // calledwhen form is submited, shows prompts accordingly
        _onSubmitEvent: function(form){
            if (methods.validate() === false) {
                // give control to the callback method, if defined
                settings.onFailure();
                // prevent the form submission
                return false;
            }
        },
        // returns true if field is valid, shows prompts accordingly
        _validateField: function(fieldElmt){
            return true;
        },
        
        _saveOptions: function(options){
        
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
            
            $(this).data('jqv', userOptions);
            return userOptions;
        }
        
    };
    
    $.fn.validationEngine = function(method){
    
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else 
            if (typeof method === 'object' || !method) {
                return methods.init.apply(this, arguments);
            }
            else {
                $.error('Method ' + method + ' does not exist on jQuery.validationEngine');
            }
    };
    
})(jQuery);

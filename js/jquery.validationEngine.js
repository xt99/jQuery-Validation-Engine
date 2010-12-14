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
	
	$.fn.validationEngine = function(settings) {
		
	if($.validationEngineLanguage){				// IS THERE A LANGUAGE LOCALISATION ?
		allRules = $.validationEngineLanguage.allRules;
	}else{
		$.validationEngine.debug("Validation engine rules are not loaded check your external file");
	}
 	settings = jQuery.extend({
		allrules:allRules,
		validationEventTriggers:"focusout",					
		inlineValidation: true,	
		returnIsValid:false,
		liveEvent:false,
		// opens a debug div for logging
		openDebug: false,
		
		// by default, the engine unbinds itself once the submit button is clicked 
		unbindEngine:true,
		containerOverflow:false,
		containerOverflowDOM:"",
		ajaxSubmit: false,
		// automatically scroll viewport to the first error
		scroll:true,
		// Opening box position, possible locations are: topLeft, topRight, bottomLeft, centerRight, bottomRight
		promptPosition: "topRight",
		success : false,
		failure : $.noop()
	}, settings);	
	$.validationEngine.settings = settings;
	$.validationEngine.ajaxValidArray = [];	// ARRAY FOR AJAX: VALIDATION MEMORY 
	
	if(settings.inlineValidation === true){ // Validating Inline ?
		if(!settings.returnIsValid){ // NEEDED FOR THE SETTING returnIsValid

			if(settings.liveEvent){	// LIVE event, vast performance improvement over BIND
				$(this).find("[class*=validate]").live(settings.validationEventTriggers,
					function(caller){ 
						if($(caller).attr("type") != "checkbox")
							_inlinEvent(this);
					});
				$(this).find("[class*=validate][type=checkbox]").live("click", function(caller){ _inlinEvent(this); });
			}else{
				$(this).find("[class*=validate]").not("[type=checkbox]").bind(settings.validationEventTriggers, function(caller){ _inlinEvent(this); });
				$(this).find("[class*=validate][type=checkbox]").bind("click", function(caller){ _inlinEvent(this); });
			}
		}
		
		function _inlinEvent(caller){
			$.validationEngine.settings = settings;
			
			// orefalo: does this test make sense?
			// STOP INLINE VALIDATION THIS TIME ONLY
			if($.validationEngine.intercept === false || !$.validationEngine.intercept){
				$.validationEngine.onSubmitValid=false;
				$.validationEngine.loadValidation(caller); 
			}else{
				$.validationEngine.intercept = false;
			}
		}
	}
	if (settings.returnIsValid){		// Do validation and return true or false, it bypass everything;
		if ($.validationEngine.submitValidation(this,settings)){
			return false;
		}else{
			return true;
		}
	}
	$(this).bind("submit", function(caller){   // ON FORM SUBMIT, CONTROL AJAX FUNCTION IF SPECIFIED ON DOCUMENT READY
		$.validationEngine.onSubmitValid = true;
		$.validationEngine.settings = settings;
		if($.validationEngine.submitValidation(this,settings) === false){
			if($.validationEngine.submitForm(this,settings) === true)
				return false;
		}else{
			// give control to the callback method, if defined
			settings.failure && settings.failure(); 
			return false;
		}		
	});
	
	// bind all formError to close on click
	$(".formError").live("click",function() {
		$(this).fadeOut(150,function(){ $(this).remove(); });
	});
};	
$.validationEngine = {
	defaultSetting : function(caller) {		// NOT GENERALLY USED, NEEDED FOR THE API, DO NOT TOUCH
		if($.validationEngineLanguage){				
			allRules = $.validationEngineLanguage.allRules;
		}else{
			$.validationEngine.debug("Validation engine rules are not loaded check your external file");
		}	
		settings = {
			allrules:allRules,
			validationEventTriggers:"blur",					
			inlineValidation: true,	
			containerOverflow:false,
			containerOverflowDOM:"",
			returnIsValid:false,
			scroll:true,
			unbindEngine:true,
			ajaxSubmit: false,
			promptPosition: "topRight",	// OPENNING BOX POSITION, IMPLEMENTED: topLeft, topRight, bottomLeft, centerRight, bottomRight
			success : false,
			failure : $.noop()
		};	
		$.validationEngine.settings = settings;
	},
	loadValidation : function(caller) {		// GET VALIDATIONS TO BE EXECUTED
		if(!$.validationEngine.settings)
			$.validationEngine.defaultSetting();
		var rulesParsing = $(caller).attr('class');
		var getRules = /\[(.*)\]/.exec(rulesParsing);
		if(getRules === null)
			return false;
		var str = getRules[1];
		var pattern = /\[|,|\]/;
		var result= str.split(pattern);	
		return $.validationEngine.validateCall(caller,result);
	},
	validateCall : function(caller,rules) {	// EXECUTE VALIDATION REQUIRED BY THE USER FOR THIS FIELD
		
		// because of the async nature of the ajax call, we need to use a global
		var promptText ="";	
		
		var elmt=$(caller);
		if(!elmt.attr("id"))
			$.validationEngine.debug("This field has no ID attribute name: "+elmt.attr("name")+" class:"+elmt.attr("class"));

		ajaxValidate = false;
		var callerName = elmt.attr("name");
		$.validationEngine.isError = false;
		$.validationEngine.showTriangle = true;
		var callerType = elmt.attr("type");

		for (var i=0; i<rules.length; i++){
			switch (rules[i]){
			case "optional": 
				if(!elmt.val()){
					$.validationEngine.closePrompt(caller);
					return $.validationEngine.isError;
				}
			break;
			case "required": 
				_required(caller,rules);
			break;
			case "custom": 
				 _customRegex(caller,rules,i);
			break;
			case "exemptString": 
				 _exemptString(caller,rules,i);
			break;
			case "ajax": 
				if(!$.validationEngine.onSubmitValid)
					_ajax(caller,rules,i);	
			break;
			case "length": 
				 _length(caller,rules,i);
			break;
			case "maxCheckbox": 
				_maxCheckbox(caller,rules,i);
			 	groupname = elmt.attr("name");
			 	caller = $("input[name='"+groupname+"']");
			break;
			case "minCheckbox": 
				_minCheckbox(caller,rules,i);
				groupname = elmt.attr("name");
			 	caller = $("input[name='"+groupname+"']");
			break;
			case "equals": 
				 _equals(caller,rules,i);
			break;
			case "funcCall": 
		     	_funcCall(caller,rules,i);
			break;
			default :
			}
		}
		radioHack();
		if ($.validationEngine.isError === true){
			var linkTofieldText = "." +$.validationEngine.linkTofield(caller);
			if(linkTofieldText != "."){
				if(!$(linkTofieldText)[0]){
					$.validationEngine.buildPrompt(caller,promptText,"error");
				}else{	
					$.validationEngine.updatePromptText(caller,promptText);
				}	
			}else{
				$.validationEngine.updatePromptText(caller,promptText);
			}
		}else{
			$.validationEngine.closePrompt(caller);
		}			
		/* UNFORTUNATE RADIO AND CHECKBOX GROUP HACKS */
		/* As my validation is looping input with id's we need a hack for my validation to understand to group these inputs */
		function radioHack(){
	      if($("input[name='"+callerName+"']").size()> 1 && (callerType == "radio" || callerType == "checkbox")) {        // Hack for radio/checkbox group button, the validation go the first radio/checkbox of the group
	          caller = $("input[name='"+callerName+"'][type!=hidden]:first");     
	          $.validationEngine.showTriangle = false;
	      }      
	    }
		/* VALIDATION FUNCTIONS */
		
		//orefalo: there should be a way around all these $(caller) calls
		function _required(caller,rules){   // VALIDATE BLANK FIELD
			
			var obj=$(caller);
			switch(obj.attr("type")) {
			case "test":
			case "password":
			case "textarea":
				if(!obj.val()){
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}	
				break;
			case "radio":
			case "checkbox":
				var callerName = obj.attr("name");
				
				if($("input[name='"+callerName+"']:checked").size() === 0) {
					$.validationEngine.isError = true;
					if($("input[name='"+callerName+"']").size() == 1) {
						promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxe+"<br />"; 
					}else{
						promptText += $.validationEngine.settings.allrules[rules[i]].alertTextCheckboxMultiple+"<br />";
					}	
				}
				break;
			case "select-one":
				// added by paul@kinetek.net for select boxes, Thank you	
				if(!obj.val()) {
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}
				break;
			case "select-multiple":
				 // added by paul@kinetek.net for select boxes, Thank you
				if(!obj.find("option:selected").val()) {
					$.validationEngine.isError = true;
					promptText += $.validationEngine.settings.allrules[rules[i]].alertText+"<br />";
				}
				break;
			}
		}
		// VALIDATE REGEX RULES
		function _customRegex(caller,rules,position){
			var obj=$(caller);
			var customRule = rules[position+1];
			var pattern = eval($.validationEngine.settings.allrules[customRule].regex);
			
			if(!pattern.test(obj.attr('value'))){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules[customRule].alertText+"<br />";
			}
		}
		// VALIDATE REGEX RULES
		function _exemptString(caller,rules,position){
			var obj=$(caller);
			var customString = rules[position+1];
			if(customString == obj.attr('value')){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules['required'].alertText+"<br />";
			}
		}
		
		function _funcCall(caller,rules,position){  		// VALIDATE CUSTOM FUNCTIONS OUTSIDE OF THE ENGINE SCOPE
			var customRule = rules[position+1];
			var funce = $.validationEngine.settings.allrules[customRule].nname;
			
			var fn = window[funce];
			if (typeof(fn) === 'function'){
				var fn_result = fn();
				if(!fn_result){
					$.validationEngine.isError = true;
				}
				
				promptText += $.validationEngine.settings.allrules[customRule].alertText+"<br />";
			}
		}
		function _ajax(caller,rules,position){				 // VALIDATE AJAX RULES
			
			//orefalo: review variable scope
			customAjaxRule = rules[position+1];
			postfile = $.validationEngine.settings.allrules[customAjaxRule].file;
			fieldValue = $(caller).val();
			ajaxCaller = caller;
			fieldId = $(caller).attr("id");
			ajaxValidate = true;
			ajaxisError = $.validationEngine.isError;
			
			if($.validationEngine.settings.allrules[customAjaxRule].extraData){
				extraData = $.validationEngine.settings.allrules[customAjaxRule].extraData;
			}else{
				extraData = "";
			}
			/* AJAX VALIDATION HAS ITS OWN UPDATE AND BUILD UNLIKE OTHER RULES */	
			if(!ajaxisError){
				$.ajax({
				   	type: "POST",
				   	url: postfile,
				   	async: true,
				   	cache: false,
				   	data: "validateValue="+fieldValue+"&validateId="+fieldId+"&validateError="+customAjaxRule+"&extraData="+extraData,
				   	beforeSend: function(){
				   		
				   		// BUILD A LOADING PROMPT IF LOAD TEXT EXIST		   			
				   		var loadingPrompt=$.validationEngine.settings.allrules[customAjaxRule].alertTextLoad;
				   		if(loadingPrompt){
				   		
				   			if(!$("div."+fieldId+"formError")[0]){
				   				//orefalo: how come this one returns and not the else
	 			 				return $.validationEngine.buildPrompt(ajaxCaller,loadingPrompt,"load");
	 			 			}else{
	 			 				$.validationEngine.updatePromptText(ajaxCaller,loadingPrompt,"load");
	 			 			}
			   			}
			  	 	},
			  	 	error: function(data,transport){ $.validationEngine.debug("error in the ajax: "+data.status+" "+transport); },
					success: function(data){
						// GET SUCCESS DATA RETURN JSON
						data = eval( "("+data+")");
						
						// GET JSON DATA FROM PHP AND PARSE IT
						ajaxCaller = $("#"+data.jsonValidateReturn[0])[0];
						customAjaxRule = data.jsonValidateReturn[1];
						ajaxisError = data.jsonValidateReturn[2];
						var fieldId = ajaxCaller;
						var existInarray;
						
						// DATA FALSE UPDATE PROMPT WITH ERROR;
			 			if(ajaxisError == "false"){			
			 				
			 				 // Check if ajax validation already used on this field
			 				existInarray=_checkInArray(fieldId, false);	
			 			 	
				 			// Simulate an ajax error to stop submit
			 			 	if(!existInarray){
			 			 		var len = $.validationEngine.ajaxValidArray.length;
				 			 	$.validationEngine.ajaxValidArray[len] =  new Array(2);
				 			 	$.validationEngine.ajaxValidArray[len][0] = fieldId;
				 			 	$.validationEngine.ajaxValidArray[len][1] = false;
				 			 	existInarray = false;
			 			 	}
				
			 			 	$.validationEngine.ajaxValid = false;
							promptText += $.validationEngine.settings.allrules[customAjaxRule].alertText+"<br />";
							$.validationEngine.updatePromptText(ajaxCaller,promptText,"",true);				
						 }else{	 
												
							existInarray=_checkInArray(fieldId, true);
						 	$.validationEngine.ajaxValid = true; 			
						 	if(!customAjaxRule)	{
						 		$.validationEngine.debug("wrong ajax response, are you on a server or in xampp? if not delete de ajax[ajaxUser] validating rule from your form ");}		   
						 	if($.validationEngine.settings.allrules[customAjaxRule].alertTextOk){	// NO OK TEXT MEAN CLOSE PROMPT	 			
	 			 				$.validationEngine.updatePromptText(ajaxCaller,$.validationEngine.settings.allrules[customAjaxRule].alertTextOk,"pass",true);
 			 				}else{
				 			 	ajaxValidate = false;		 	
				 			 	$.validationEngine.closePrompt(ajaxCaller);
 			 				}		
			 			 }
			 			function _checkInArray(fieldId, validate){
			 				var array=$.validationEngine.ajaxValidArray;
			 				for(var x=0; x<array.length; x++){
			 			 		if(array[x][0] == fieldId){
			 			 			array[x][1] = validate;
			 			 			return true;
			 			 		}
			 			 	}
			 				return false;
			 			}
			 		}				
				});
			}
		}
		function _equals(caller,rules,position){		 // VALIDATE FIELD MATCH
			var equalsField = rules[position+1];
			
			if($(caller).attr('value') != $("#"+equalsField).attr('value')){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["equals"].alertText+"<br />";
			}
		}
		function _length(caller,rules,position){    	  // VALIDATE LENGTH
			// orefalo: there should be a way around the use of eval
			var startLength = eval(rules[position+1]);
			var endLength = eval(rules[position+2]);
			var feildLength = $(caller).attr('value').length;

			if(feildLength<startLength || feildLength>endLength){
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["length"].alertText+startLength+$.validationEngine.settings.allrules["length"].alertText2+endLength+$.validationEngine.settings.allrules["length"].alertText3+"<br />";
			}
		}
		function _maxCheckbox(caller,rules,position){  	  // VALIDATE CHECKBOX NUMBER
		
			var nbCheck = eval(rules[position+1]);
			var groupname = $(caller).attr("name");
			var groupSize = $("input[name='"+groupname+"']:checked").size();
			if(groupSize > nbCheck){	
				$.validationEngine.showTriangle = false;
				$.validationEngine.isError = true;
				promptText += $.validationEngine.settings.allrules["maxCheckbox"].alertText+"<br />";
			}
		}
		function _minCheckbox(caller,rules,position){  	  // VALIDATE CHECKBOX NUMBER
		
			var nbCheck = eval(rules[position+1]);
			var groupname = $(caller).attr("name");
			var groupSize = $("input[name='"+groupname+"']:checked").size();
			if(groupSize < nbCheck){	
			
				$.validationEngine.isError = true;
				$.validationEngine.showTriangle = false;
				promptText += $.validationEngine.settings.allrules["minCheckbox"].alertText+" "+nbCheck+" "+$.validationEngine.settings.allrules["minCheckbox"].alertText2+"<br />";
			}
		}
		return ($.validationEngine.isError) ? $.validationEngine.isError : false;
	},
	submitForm : function(caller){
		var obj=$(caller);
		if ($.validationEngine.settings.success) {	// AJAX SUCCESS, STOP THE LOCATION UPDATE
			if($.validationEngine.settings.unbindEngine)
				obj.unbind("submit");
			var serializedForm = obj.serialize();
			// orefalo: weird settings.seccess is a boolean -> should be beforeSuccess()
			$.validationEngine.settings.success && $.validationEngine.settings.success(serializedForm);
			return true;
		}
		return false;
	},
	// Creates an error prompt and display it, also used for ajax loading prompts
	buildPrompt : function(caller,promptText,type,ajaxed) {
		
		var obj=$(caller);
		
		if(!$.validationEngine.settings) {
			$.validationEngine.defaultSetting();
		}
		var deleteItself = "." + obj.attr("id") + "formError";
	
		if($(deleteItself)[0]) {
			$(deleteItself).stop();
			$(deleteItself).remove();
		}
		var divFormError = $('<div/>');
		var formErrorContent = $('<div/>');
		var linkTofield = $.validationEngine.linkTofield(caller);
		divFormError.addClass("formError");
		
		if(type == "pass")
			divFormError.addClass("greenPopup");
		if(type == "load")
			divFormError.addClass("blackPopup");
		if(ajaxed)
			divFormError.addClass("ajaxed");
		
		divFormError.addClass(linkTofield);
		formErrorContent.addClass("formErrorContent");
		
		if($.validationEngine.settings.containerOverflow)		// Is the form contained in an overflown container?
			$(caller).before(divFormError);
		else
			$("body").append(divFormError);
				
		divFormError.append(formErrorContent);
			
		// NO TRIANGLE ON MAX CHECKBOX AND RADIO
		if($.validationEngine.showTriangle != false){		
			var arrow = $('<div/>');
			arrow.addClass("formErrorArrow");
			divFormError.append(arrow.get());
			switch($.validationEngine.settings.promptPosition)
			{
			case "bottomLeft":
			case "bottomRight":
				arrow.addClass("formErrorArrowBottom");
				arrow.html('<div class="line1"><!-- --></div><div class="line2"><!-- --></div><div class="line3"><!-- --></div><div class="line4"><!-- --></div><div class="line5"><!-- --></div><div class="line6"><!-- --></div><div class="line7"><!-- --></div><div class="line8"><!-- --></div><div class="line9"><!-- --></div><div class="line10"><!-- --></div>');
				break;
			case "topLeft":
			case "topRight":
				divFormError.append(arrow);
				arrow.html('<div class="line10"><!-- --></div><div class="line9"><!-- --></div><div class="line8"><!-- --></div><div class="line7"><!-- --></div><div class="line6"><!-- --></div><div class="line5"><!-- --></div><div class="line4"><!-- --></div><div class="line3"><!-- --></div><div class="line2"><!-- --></div><div class="line1"><!-- --></div>');
				break;
			}
		}
		formErrorContent.html(promptText);
		
		var calculatedPosition = $.validationEngine.calculatePosition(caller,promptText,type,ajaxed,divFormError.get());
		divFormError.css({
			"top":calculatedPosition.callerTopPosition+"px",
			"left":calculatedPosition.callerleftPosition+"px",
			"marginTop":calculatedPosition.marginTopSize+"px",
			"opacity":0
		});

		return divFormError.animate({"opacity":0.87});
	},
	// UPDATE TEXT ERROR IF AN ERROR IS ALREADY DISPLAYED
	updatePromptText : function(caller,promptText,type,ajaxed) {
		
		var linkTofield = $.validationEngine.linkTofield(caller);
		var updateThisPrompt =  "."+linkTofield;
		
		if(type == "pass")
			$(updateThisPrompt).addClass("greenPopup");
		else
			$(updateThisPrompt).removeClass("greenPopup");
		
		if(type == "load")
			$(updateThisPrompt).addClass("blackPopup");
		else
			$(updateThisPrompt).removeClass("blackPopup");
		
		if(ajaxed)
			$(updateThisPrompt).addClass("ajaxed");
		else
			$(updateThisPrompt).removeClass("ajaxed");
	
		$(updateThisPrompt).find(".formErrorContent").html(promptText);
		
		var calculatedPosition = $.validationEngine.calculatePosition(caller,promptText,type,ajaxed,updateThisPrompt);
		calculatedPosition.callerTopPosition +="px";
		calculatedPosition.callerleftPosition +="px";
		calculatedPosition.marginTopSize +="px";
		$(updateThisPrompt).animate({ "top":calculatedPosition.callerTopPosition,"marginTop":calculatedPosition.marginTopSize });
	},
	
	// Calculates prompt position
	calculatePosition : function(caller,promptText,type,ajaxed,divFormError){
		
		var elmt=$(caller);
		var callerTopPosition,callerleftPosition,marginTopSize;
		var callerWidth = elmt.width();
		var inputHeight =$(divFormError).height(); 
		
		var overflow=$.validationEngine.settings.containerOverflow;
		if(overflow){
			// Is the form contained in an overflown container?
			callerTopPosition = callerleftPosition = 0;
			// compasation for the triangle
			marginTopSize = "-"+inputHeight; 
		}else{
			callerTopPosition = elmt.offset().top;
			callerleftPosition = elmt.offset().left;
			marginTopSize = 0;
		}
		
		// POSITIONNING
		switch($.validationEngine.settings.promptPosition) {
		
		default:
		case "topRight":
			if(overflow){		// Is the form contained in an overflown container?
				callerleftPosition += callerWidth -30;
			}else{
				callerleftPosition +=  callerWidth -30; 
				callerTopPosition += -inputHeight; 
			}
			break;
		case "topLeft":
			callerTopPosition += -inputHeight -10;
			break;
		case "centerRight":
			callerleftPosition += callerWidth +13;
			break;
		case "bottomLeft":
			callerTopPosition = callerTopPosition + elmt.height() + 15;
			break;
		case "bottomRight":
			callerleftPosition +=  callerWidth -30;
			callerTopPosition +=  elmt.height() +5;
		}

		return {
			"callerTopPosition":callerTopPosition,
			"callerleftPosition":callerleftPosition,
			"marginTopSize":marginTopSize
		};
	},
	linkTofield : function(caller){
		var linkTofield = $(caller).attr("id") + "formError";
		linkTofield = linkTofield.replace(/\[/g,""); 
		linkTofield = linkTofield.replace(/\]/g,"");
		return linkTofield;
	},
	closePrompt : function(caller,outside) {						// CLOSE PROMPT WHEN ERROR CORRECTED
		if(!$.validationEngine.settings){
			$.validationEngine.defaultSetting();
		}
		if(outside){
			$(caller).fadeTo("fast",0,function(){
				$(caller).remove();
			});
			return false;
		}
		
		// orefalo -- do we even need this check? in the test below ajaxValidate === false should do it, right ?
		if(typeof(ajaxValidate)=='undefined')
		{ ajaxValidate = false; }
		
		if(!ajaxValidate){
			var linkTofield = $.validationEngine.linkTofield(caller);
			var closingPrompt = "."+linkTofield;
			$(closingPrompt).fadeTo("fast",0,function(){
				$(closingPrompt).remove();
			});
		}
	},
	debug : function(error) {
		if(!$.validationEngine.settings.openDebug) return false;
		if(!$("#debugMode")[0]){
			$("body").append("<div id='debugMode'><div class='debugError'><strong>This is a debug mode, you got a problem with your form, it will try to help you, refresh when you think you nailed down the problem</strong></div></div>");
		}
		$(".debugError").append("<div class='debugerror'>"+error+"</div>");
	},
	// FORM SUBMIT VALIDATION LOOPING INLINE VALIDATION
	submitValidation : function(caller) {
		var obj=$(caller);
		var stopForm = false;
		$.validationEngine.ajaxValid = true;
		var toValidateSize = obj.find("[class*=validate]").size();
		
		obj.find("[class*=validate]").each(function(){
			var linkTofield = $.validationEngine.linkTofield(this);
			
			// DO NOT UPDATE ALREADY AJAXED FIELDS (only happen if no normal errors, don't worry)
			if(!$("."+linkTofield).hasClass("ajaxed")){	
				
				var validationPass = $.validationEngine.loadValidation(this);
				return(validationPass) ? stopForm = true : "";					
			};
		});
		// LOOK IF SOME AJAX IS NOT VALIDATE
		var ajaxErrorLength = $.validationEngine.ajaxValidArray.length; 
		for(var x=0;x<ajaxErrorLength;x++){
	 		if($.validationEngine.ajaxValidArray[x][1] == false)
	 			$.validationEngine.ajaxValid = false;
 		}
		// GET IF THERE IS AN ERROR OR NOT FROM THIS VALIDATION FUNCTIONS
		if(stopForm || !$.validationEngine.ajaxValid){ 
			if($.validationEngine.settings.scroll){
				if(!$.validationEngine.settings.containerOverflow){
					
					// get the position of the first error
					var destination = $(".formError:not('.greenPopup'):first").offset().top;
					$(".formError:not('.greenPopup')").each(function(){
						var testDestination = $(this).offset().top;
						if(destination>testDestination)
							destination = $(this).offset().top;
					});
					$("html:not(:animated),body:not(:animated)").animate({ scrollTop: destination}, 1100);
				}else{
					var destination = $(".formError:not('.greenPopup'):first").offset().top;
					var scrollContainerScroll = $($.validationEngine.settings.containerOverflowDOM).scrollTop();
					var scrollContainerPos = - parseInt($($.validationEngine.settings.containerOverflowDOM).offset().top);
					destination = scrollContainerScroll + destination + scrollContainerPos -5;
					var scrollContainer = $.validationEngine.settings.containerOverflowDOM+":not(:animated)";
					
					$(scrollContainer).animate({ scrollTop: destination}, 1100);
				}
			}
			return true;
		}else{
			return false;
		}
	}
};
})(jQuery);
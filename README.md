jQuery.validationEngine v2.0
=====

Summary
---

jQuery validation engine is a javascript plugin aiming the validation of form fields on the browser.
The plugin provides some visually appealing prompts that grab user attention on the subject matter.

Validations range from email, phone, url to the more complex calls such as ajax processing.
Bundled in several locales, the error prompts can be easily translated in your favorite language. 

![Screenshot](https://github.com/orefalo/jQuery-Validation-Engine/raw/master/css/screenshot.png)

**Important**: v2 is a significant rewrite of the original 1.7 branch. Please read the documentation as the API has changed!


Installation
---

### What's in the archive?

The archive holds of course the core library along with translations in different languages.
It also comes with a set of demo pages and a simple ajax server (built in Java).

1. Unpack the archive
2. Include the script jquery.validationEngine.closure.js in your page 
3. Pick the locale of the choice, include it in your page: jquery.validationEngine-XX.js
4. **Read this manual** and understand the API


### Running the Demos

Most demos are functional by opening their respective HTML file. However, the Ajax demos require the use of Java6 to launch a lightweight http server. 

1. Run the script `runDemo.bat` (Windows) or `runDemo.sh` (Unix) from the folder
2. Open a browser pointing at [http://localhost:9173](http://localhost:9173)


Usage
---

### References

First link jQuery to the page

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.js" type="text/javascript"></script>
    
Attach *jquery.validationEngine* and its locale

    <script src="js/jquery.validationEngine-en.js" type="text/javascript" charset="utf-8"></script>
    <script src="js/jquery.validationEngine.js" type="text/javascript" charset="utf-8"></script>

Finally link the desired theme

    <link rel="stylesheet" href="css/validationEngine.jquery.css" type="text/css"/>


### Field validations

Validations are defined using the field's **class** attribute. Here are a few examples showing how it happens:

    <input value="someone@nowhere.com" class="validate[required,custom[email]] text-input" type="text" name="email" id="email" />
    <input value="2010-12-01" class="validate[required,custom[date]] text-input" type="text" name="date" id="date" />
    <input value="too many spaces obviously" class="validate[required,custom[noSpecialCharacters]] text-input" type="text" name="special" id="special" />

For more details about validators, please refer to the section below.

### Instantiation

The validator is typically instantiated by using a call of the following form:

    $("#form.id").validationEngine(action or options);

The method takes one or several optional parameters, either an action (and parameters) or a list of options to customize the behavior of the engine.

Here comes a glimpse: say you have a form is this kind
    <form id="formID" method="post" action="submit.action">
        <input value="2010-12-01" class="validate[required,custom[date]] text-input" type="text" name="date" id="date" />
    </form>

The following code would instance the validation engine:
    <script>
    $(document).ready(function(){
        $("#formID").validationEngine('attach');
       });
    </script>

Actions
---

### init

Initializes the engine with default settings

    $("#formID1").validationEngine({promptPosition : "centerRight", scroll: false});
    $("#formID1").validationEngine('init', {promptPosition : "centerRight", scroll: false});

### attach

Attaches jQuery.validationEngine to form.submit and field.blur events.

    $("#formID1").validationEngine('attach');

### detach

Unregisters any bindings that may point to jQuery.validaitonEngine.

    $("#formID1").validationEngine('detach');

### validate

Validates the form and displays prompts accordingly. 
Returns *true* if the form validates, *false* if it contains errors and *undefined* if you use an ajax form validator. In which can you will to provide an *onAjaxFormComplete* function to process the asynchronous call.

    alert( $("#formID1").validationEngine('validate') );

### showPrompt (promptText, type, promptPosition, showArrow)

Displays a prompt on a given element. Note that the prompt can be displayed on any element an id.

The method takes four parameters: 
1. the text of the prompt itself
2. a type which defines the visual look of the prompt: 'pass' (green), 'load' (black) anything else (red)
3. an optional position: either "topLeft", "topRight", "bottomLeft", "centerRight", "bottomRight". Defaults to *"topRight"*
4. an optional boolean which tells if the prompt should display a directional arrow

    <fieldset>
       <legend id="legendid">Email</legend>
       <a href="#" onclick="$('#legendid').validationEngine('showPrompt', 'This a custom msg', 'load')">Show prompt</a>
    </fieldset>

### hide

Closes error prompts in the current form (in case you have more than one form on the page)

    $('#formID1').validationEngine('hide')">Hide prompts

### hideAll

Closes **all** error prompts on the page.

    $('#formID1').validationEngine('hideAll');

Options
---

Options are typically passed to the init action as a parameter.
    $("#formID1").validationEngine({promptPosition : "centerRight", scroll: false});

### validationEventTrigger
Name of the event triggering field validation, defaults to *blur*.
                
### scroll
Tells if we should scroll the page to the first error, defaults to *true*.

### promptPosition
Where should the prompt show ? possible values are "topLeft", "topRight", "bottomLeft", "centerRight", "bottomRight". Defaults to *"topRight"*.

### ajaxFormValidationURL
If set to a URL, turns the ajax form validation logic on.
When the validate() action is performed, an ajax server call is achieved. result is asynchronously delivered to the onAjaxFormComplete function.

### onBeforeAjaxFormValidation
function called before the asynchronous AJAX form validation call. May return false to stop the ajax form validation
            
### onAjaxFormComplete: function(form, status, errors, options)
function used to asynchronously process the result of the ajax form validation. only called when ajaxFormValidationURL is set to a URL.

### isOverflown
Set to true when the form shows in a scrolling div, defaults to *false*.

### overflownDIV
Selector used to pick the overflown container, defaults to *""*.

Validators
---

Validators are encoded in the field's class attribute, as such

### required
Speaks by itselfs, fails if the element has no value. this validator can apply to pretty much any kind of input field.

    <input value="" class="validate[required] text-input" type="text" name="email" id="email" />
    <input class="validate[required] checkbox" type="checkbox" id="agree" name="agree"/>

    <select name="sport" id="sport" class="validate[required]" id="sport">
       <option value="">Choose a sport</option>
       <option value="option1">Tennis</option>
       <option value="option2">Football</option>
       <option value="option3">Golf</option>
    </select>

### custom[selector]
Validates the element's value to a predefined list of regular expressions.

    <input value="someone@nowhere.com" class="validate[required,custom[email]] text-input" type="text" name="email" id="email" />

### function[methodName]
Validates a field using a third party function call. If a validation error occurs, the function may return an error message that will automatically should in the error prompt.


    function checkHELLO(field, rules, i, options){
      if (field.val() != "HELLO") {
         // this allows to use i18 for the error msgs
         return options.allrules.validate2fields.alertText;
      }
    }

The following declaration will do            
    <input value="" class="validate[required,funcCall[checkHELLO]] text-input" type="text" id="lastname" name="lastname" />
 

### ajax[selector]

The validator is explained in further details in the Ajax section

### min[float]

### max[float]

### minSize[integer]
Validates if the element content size (in characters) is more or equal to the given *integer*. integer <= input.value.length

### maxSize[integer]
Validates if the element content size (in characters) is less or equal to the given *integer*. input.value.length <= integer

### past[NOW or a date]
Checks if the element's value (which is implicitly a date) is earlier than the given *date*. Note that if you pass NOW, the date will be calculate in the browser and may be different that the server date.

### future[NOW or a date]
Checks if the element's value (which is implicitly a date) is greater than the given *date*. Note that if you pass NOW, the date will be calculate in the browser and may be different that the server date.

### minCheckbox[integer]

Validates when a minimum of *integer* checkboxes are selected.
The validator uses a special naming convention to identify the checkboxes part of the group.

The following example, enforces a minimum of two selected checkboxes
    <input class="validate[minCheckbox[2]] checkbox" type="checkbox" name="data[User3][preferedColor]" id="maxcheck1" value="5"/>
    <input class="validate[minCheckbox[2]] checkbox" type="checkbox" name="data[User3][preferedColor]" id="maxcheck2" value="3"/>
    <input class="validate[minCheckbox[2]] checkbox" type="checkbox" name="data[User3][preferedColor]" id="maxcheck3" value="9"/>
     

Ajax
---

Ajax validation comes in two flavors:

1. Field ajax validations, which takes place when the user inputs a value in a field and moves to the next.
2. Form ajax validation, which takes place when the form is submitted or when the validate() action is called.


### Field ajax validation


### Form ajax validation

It is important to note that Form ajax validation doesn't submit to the form.action url. You need to provide a link


Custom regex
---




Overflow
---

REVIEW REVIEW
The big change in this method is that normally the engine will append every error boxes to the body. In this case it will append every error boxes before the input validated. This add a bit of complexity, if you want the error box to behave correctly you need to wrap the input in a div being position relative, and exactly wrapping the input width and height. The easiest way to do that is by adding float:left, like in the example provided.





Customizations
---

### Adding regular expressions




### Customizing the look and feel
Edit the file *validationEngine.jquery.css* and customize the styelesheet to your likings. it's trivial.

### Adding more locales
You can easy add a locale by taking *jquery.validationEngine-en.js* as an example. 
Feel free to provide us the translation ;-)

Rules of thumb
---

* field.id are **unique** across the page
* for simplicity and consistency field.id and field.name should match
* spaces or special chars should be avoided in field.id or field.name
* use lower cases for input.type  ie. *text, password, textarea, checkbox, radio*
* use the ajax validator last ie. *validate[custom[onlyLetter],length[0,100],ajax[ajaxNameCall]]*
* use only one ajax validator per field!
* json services should live on the same server (or you will get into security issues)
* in a perfect RESTful world, http **GET** is used to *READ* data, http **POST** is used to *WRITE* data: which translates into -> ajax validations should use GET, the actual form post should use POST

Contribution
---
Contributions are always welcome, you may refer to the latest stable project at [GitHub](https://github.com/posabsolute/jQuery-Validation-Engine)
We use [Aptana](http://www.aptana.com/) as a Javascript editor and the Rockstart JSLint & Closure plugins http://update.rockstarapps.com/site.xml

License
---
Licensed under the MIT Licence


Authors
---

 Copyright(c) 2010 [Cedric Dugas](https://github.com/posabsolute) [http://www.position-absolute.com](http://www.position-absolute.com)
 
 v2.0 Rewrite by [Olivier Refalo](https://github.com/orefalo) [http://www.crionics.com](http://www.crionics.com)
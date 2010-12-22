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

    <link rel="stylesheet" href="css/validationEngine.jquery.css" type="text/css"/>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.js" type="text/javascript"></script>
    <script src="js/jquery.validationEngine-en.js" type="text/javascript" charset="utf-8"></script>
    <script src="js/jquery.validationEngine.js" type="text/javascript" charset="utf-8"></script>

### Field validations

Validations are defined using the field's **class** attribute. Here are a few examples showing how it happens:

    <input value="someone@nowhere.com" class="validate[required,custom[email]] text-input" type="text" name="email" id="email" />
    <input value="2010-12-01" class="validate[required,custom[date]] text-input" type="text" name="date" id="date" />
    <input value="too many spaces obviously" class="validate[required,custom[noSpecialCaracters]] text-input" type="text" name="special" id="special" />

For more details about validators, please refer to the section below.

### Instantiation

The validator is typically instantiated by using a call of the following form:

    $("#form.id").validationEngine(action or options);

The method takes optional parameters, either an action or a list of options to customize the behavior of the engine.

Say you have a form is this kind:
    <form id="formID" method="post" action="submit.action">
        <input value="2010-12-01" class="validate[required,custom[date]] text-input" type="text" name="date" id="date" />
    </form>

You would instance the validation engine with the following code:
    <script>
    $(document).ready(function(){
        $("#formID").validationEngine('attach');
       });
    </script>

Actions
---

### init

Typically not called direct as it is implicitly run before any other action. Can be used to initialize the engine with different settings, as such

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

### showPrompt ( promptText, type )

Displays a prompt on a given element. Note that the prompt can be displayed on any element an id.
The method two parameters: a prompt text, and a type which defined the visual look of the prompt: 'pass' (green), 'load' (black) anything else (red)

    <fieldset>
       <legend id="legendid">Email</legend>
       <a href="#" onclick="$('#legendid').validationEngine('showPrompt', 'This a custom msg', 'load')">Show prompt</a>
    </fieldset>

### hide

Closes form error prompts (in case you have more than one form on the page)

    $('#formID1').validationEngine('hide')">Hide prompts

### hideAll

Closes all error prompts on the page.

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
When the validate() call is performed, an ajax server call is achieved. result is asynchronously delivered to the onAjaxFormComplete function.

              
### onAjaxFormComplete: function(form, status, errors, options)
function used to asynchronously process the result of the ajax form validation. only called when ajaxFormValidationURL is set to a URL.

### isOverflown
Set to true when the form shows in a scrolling div, defaults to *false*.

### overflownDIV
Selector used to pick the overflown container, defaults to *""*.

Validators
---

### Required

### Custom

### Function

### Ajax

The validator is explained in further details in the Ajax sections


Ajax
---




Customizations
---

### Adding regular expressions




### Customizing the look and feel



### Adding more locales




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


License
---
Licensed under the MIT Licence


Authors
---

 Copyright(c) 2010, Cedric Dugas [http://www.position-absolute.com](http://www.position-absolute.com)
 
 2.0 Rewrite by Olivier Refalo [http://www.crionics.com](http://www.crionics.com)
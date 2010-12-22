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

### Instantiation

The validator is typically instantiated by using a call of the following form:

    $("#form.id").validationEngine(action or options);

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

### Field validations

Validations are defined using the field's class attribute. Here are a few examples showing how it happens:

    <input value="someone@nowhere.com" class="validate[required,custom[email]] text-input" type="text" name="email" id="email" />
    <input value="2010-12-01" class="validate[required,custom[date]] text-input" type="text" name="date" id="date" />
    <input value="too many spaces obviously" class="validate[required,custom[noSpecialCaracters]] text-input" type="text" name="special" id="special" />

For more 

Actions
---



Options
---


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

* field.id are *unique* across the page
* for simplicity and consistency field.id and field.name should match
* use the ajax validator last
* use lower cases for input.type  ie. text, password, textarea, checkbox, radio
* don't use spaces or special chars in field.id or field.name
* use only one ajax validator per field!
* json services should live on the same server (or you will get into security issues)
* in a perfect RESTful world, http **GET** is used to *READ* data, http **POST** is used to *WRITE* data: which translates into -> ajax validations should use GET, the actual form post should use POST

Contributing
---
Contributions are always welcome, you may refer to the latest stable project at [GitHub](https://github.com/posabsolute/jQuery-Validation-Engine)


License
---
Licensed under the MIT Licence


Authors
---

 Copyright(c) 2010, Cedric Dugas
 http://www.position-absolute.com
 
 2.0 Rewrite by Olivier Refalo
 http://www.crionics.com
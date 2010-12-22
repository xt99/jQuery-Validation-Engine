jQuery.validationEngine
=====

Summary
---

Explain what the API does, high level
add a gfx

Running the Demos
---

Most demos are functional by opening their respective HTML file.

However, Java 6 is required to run the Ajax demos.
Run the script runDemo.bat (windows) or runDemo.sh (unix) from the folder.
then open a browser to http://localhost:9137

Installation
---



### What's in the archive?

The archive hold of course the core library along with translations in different languages.
It also comes with a set of demo pages and a simple ajax server (built in Java).


Usage
---


Give all the details, come on... don't b shy

`here comes some code`

### options


Validators
---

### Required

### Custom <- I don't like custom, should b regex

### Function

### Ajax

Please refer to the next section for more details about ajax validation in general.


Ajax validation
---




Customizations
---

### Rules

Adding regular expressions


### CSS

### i18n

Rules of thumb
---

- id are *unique* across the page
- for simplicity and consistency field.id and field.name should match
- use the ajax validator last
- use lower cases for input.type  ie. text, password, textarea, checkbox, radio
- don't use spaces or special chars in id and names
- use only one ajax validator per field!
- json services should live on the same server (or you will get into security issues)
- in a perfectc RESTful world, http GET is to READ data, http POST is to WRITE data: which translates into -> ajax validation should use GET, the actual form post should use POST

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
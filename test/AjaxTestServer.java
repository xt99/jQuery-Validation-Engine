import java.io.IOException;
import java.util.Properties;

/**
 * This java class implements a basic HTTP server aimed at testing the
 * jQuery.validate AJAX capabilities. Note that this file shouldn't be taken as
 * best practice for java backend development. There are much better frameworks
 * to do server side processing in Java, for instance, the Play Framework.
 * 
 * @author Olivier Refalo
 */
public class AjaxTestServer extends NanoHTTPD {

    private static final int PORT = 9173;
    public static final String MIME_JSON = "application/json";

    public AjaxTestServer() throws IOException
    {
	super(PORT);
    }

    public Response serve(String uri, String method, Properties header, Properties parms)
    {

	// This is a field validation, we get 3 parameters: fieldId, fieldValue
	// and fieldErrorMsg
	// Validates when field equals "karnius"
	if ("ajaxValidateFieldUser".equals(uri))
	{
	    System.out.println(method + " '" + uri + "'");

	    // purposely sleep to let the UI display the AJAX loading prompts
	    sleep(3000);

	    String fieldId = parms.getProperty("fieldId");
	    String fieldValue = parms.getProperty("fieldValue");
	    String rule = parms.getProperty("rule");

	    String json;
	    if ("karnius".equals(fieldValue))
		json = "true";
	    else
	    {
		String[] result = { fieldId, rule, "false" };
		json = genError(result);
	    }
	    return new NanoHTTPD.Response(HTTP_OK, MIME_JSON, json);
	}
	// This is a form validation, we get the form data
	// validates when email=someone@here.com, with age 65
	else if ("ajaxSubmitForm".equals(uri))
	{

	    System.out.println(method + " '" + uri + "'");

	    // purposely sleep to let the UI display the AJAX loading prompts
	    sleep(3000);

	    String email = parms.getProperty("email");
	    String age = parms.getProperty("age");

	    String json;
	    if (!"someone@here.com".equals(email))
	    {
		String[] result = { "#email", "The email doesn't match someone@here.com", "error" };
		json = genError(result);
	    } else if (!"65".equals(age))
	    {
		String[] result = { "#age", "The age must be 65", "error" };
		json = genError(result);
	    } else
	    {
		json = "true";
	    }
	    return new NanoHTTPD.Response(HTTP_OK, MIME_JSON, json);
	}
	return super.serve(uri, method, header, parms);
    }

    private String genError(String[] result)
    {
	// PlayFramework! typically comes with its own JSON marshaler, this is dirty way
	// around the need to import a third party library and add complexity
	StringBuffer json = new StringBuffer();

	// {"jsonValidateReturn":["fieldId","prompt error","validation result:true/false"]}
	json.append("{'jsonValidateReturn':[");
	for (int i = 0; i < result.length; i++)
	{
	    json.append(result[i]);
	    if (i < result.length)
		json.append(",");
	}
	json.append("]}");
	return json.toString();
    }

    /**
     * Sleeps the current thread for the given delay
     * 
     * @param duration
     *            in ms
     */
    private void sleep(long duration)
    {
	try
	{
	    Thread.sleep(duration);
	} catch (InterruptedException e)
	{

	    e.printStackTrace();
	}
    }

    /**
     * Application start point, starts the httpd server
     * 
     * @param args
     *            command line arguments
     */
    public static void main(String[] args)
    {
	try
	{
	    new AjaxTestServer();
	} catch (IOException ioe)
	{
	    System.err.println("Couldn't start server:\n" + ioe);
	    System.exit(-1);
	}
	System.out.println("Listening on port " + PORT + ". Hit Enter to stop.\nPlease open your browsers to http://localhost:"
		+ PORT);
	try
	{
	    System.in.read();
	} catch (Throwable t)
	{
	}
    }
}
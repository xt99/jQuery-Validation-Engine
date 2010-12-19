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

	public AjaxTestServer() throws IOException {
		super(PORT);
	}

	public Response serve(String uri, String method, Properties header, Properties parms) {

		if ("ajaxValidateFieldUser".equals(uri)) {

			System.out.println(method + " '" + uri + "' ");

			// purposely sleep to let the UI display the AJAX loading prompts
			sleep(3000);

			String validateValue = parms.getProperty("validateValue");
			String validateId = parms.getProperty("validateId");
			String validateError = parms.getProperty("validateError");

			Object[] result = new String[3];
			result[0] = validateId;
			result[1] = validateError;
			result[2] = new Boolean("karnius".equals(validateValue));

			// Play! comes with its own JSON marshaller, this is only there for
			// simplicity
			StringBuffer json = new StringBuffer();

			// {"jsonValidateReturn":["fieldId","prompt error","validation result:true/false"]}
			json.append("{'jsonValidateReturn':[");
			for (int i = 0; i < result.length; i++) {
				json.append(result[i]);
				if (i < result.length)
					json.append(",");
			}
			json.append("]}");

			return new NanoHTTPD.Response(HTTP_OK, MIME_JSON, json.toString());
		} else if ("ajaxSubmitForm".equals(uri)) {
			System.out.println(method + " '" + uri + "' ");

			// purposely sleep to let the UI display the AJAX loading prompts
			sleep(3000);

		}
		return super.serve(uri, method, header, parms);
	}

	private void sleep(long duration) {
		try {
			Thread.sleep(duration);
		} catch (InterruptedException e) {

			e.printStackTrace();
		}
	}

	public static void main(String[] args) {
		try {
			new AjaxTestServer();
		} catch (IOException ioe) {
			System.err.println("Couldn't start server:\n" + ioe);
			System.exit(-1);
		}
		System.out.println("Listening on port " + PORT + ". Hit Enter to stop.\nPlease open your browsers to http://localhost:"
				+ PORT);
		try {
			System.in.read();
		} catch (Throwable t) {
		}
		
	}
}
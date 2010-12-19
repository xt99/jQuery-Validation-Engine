import java.io.IOException;
import java.util.Properties;

/**
 * An example of subclassing NanoHTTPD to make a custom HTTP server.
 */
public class AjaxTestServer extends NanoHTTPD {

	private static final int PORT = 9173;

	public AjaxTestServer() throws IOException {
		super(PORT);
	}

	public Response serve(String uri, String method, Properties header, Properties parms) {

		if ("test1".equals(uri)) {

			System.out.println(method + " '" + uri + "' ");
			String msg = "<html><body><h1>Hello server</h1>\n";
			if (parms.getProperty("username") == null)
				msg += "<form action='?' method='get'>\n" + "  <p>Your name: <input type='text' name='username'></p>\n"
						+ "</form>\n";
			else
				msg += "<p>Hello, " + parms.getProperty("username") + "!</p>";

			msg += "</body></html>\n";
			return new NanoHTTPD.Response(HTTP_OK, MIME_HTML, msg);
		} else
			return super.serve(uri, method, header, parms);
	}

	public static void main(String[] args) {
		try {
			new AjaxTestServer();
		} catch (IOException ioe) {
			System.err.println("Couldn't start server:\n" + ioe);
			System.exit(-1);
		}
		System.out.println("Listening on port " + PORT + ". Hit Enter to stop.\n");
		try {
			System.in.read();
		} catch (Throwable t) {
		}
		;
	}
}
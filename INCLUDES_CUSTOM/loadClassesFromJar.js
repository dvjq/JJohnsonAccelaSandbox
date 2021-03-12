/**
 * Load a class from a local or remote JAR file.
 *
 * Author: Daniel Hawkins
 * TFS 134062
 *
 *
 * @param jarUrl
 * The string url for the jar file you would like to link in.
 * The string is taken verbatim, so there must be the jar: prefix and !/ suffix on the url.
 *
 * @param classNameArr
 * An array of strings containing the list of classes you would like to load from the jar file.
 *
 * @return
 * An array of classes of the specified class objects, with nulls in places corresponding to where
 * the classes could not be loaded from classNameArr.
 * 
 * Modified to just return a single class, I think readability is better this way.
 */
function loadClassFromJar(jarUrl, className) {
	var URL = new java.net.URL(jarUrl);
	var loader = new java.net.URLClassLoader([ URL ]);
	var classes_loaded = [];
	// for ( var i in classNameArr) {
		try {
			// classes_loaded[i] = loader.loadClass(classNameArr[i]);
			logDebug("Loaded class " + classNameArr[i] + " successfully.<br />");
			return loader.loadClass(className);
		} catch (e) {
			//classes_loaded[i] = null;
			logDebug("Failed to load class " + classNameArr[i] + ": " + e.Message + "<br />");
			return null;
		}
	// }
	// return classes_loaded;
}
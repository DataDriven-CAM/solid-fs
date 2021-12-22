# solid-fs
client side functionality of the node fs API interfacing to a solid pod

### Install
pnpm install

gulp

### Header scripts
```
  <script type="text/javascript" src="js/isomorphic-git/index.umd.min.js"></script>
  <script type="text/javascript" src="js/rdflib.min.js"></script>
  <script type="text/javascript" src="js/N3.bundle.js"></script>
  <script type="text/javascript" src="js/solid-fs.js"></script>

```

### Pass session to the SolidFileSystem
```
import { handleIncomingRedirect, login, fetch, getDefaultSession } from './js/solid-client-authn-browser/solid-client-authn.bundle.js'

    const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');
async function loginToPod(idp) {
    await handleIncomingRedirect();
  if (!getDefaultSession().info.isLoggedIn) {
    // The `login()` redirects the user to their identity provider;
    // i.e., moves the user away from the current page.
    await login({
      // Specify the URL of the user's Solid Identity Provider; e.g., "https://broker.pod.inrupt.com" or "https://inrupt.net"
      oidcIssuer: "https://localhost:8443/",
      // Specify the URL the Solid Identity Provider should redirect to after the user logs in,
      // e.g., the current page for a single-page app.
      redirectUrl: window.location.href,
      // Pick an application name that will be shown when asked 
      // to approve the application's access to the requested data.
      clientName: "Repository Client"
    });
  }
  //const session = new Session();
  window.fs = new SolidFileSystem(getDefaultSession());
  // Initialize isomorphic-git with our new file system
  git.plugins.set('fs', window.fs);
}
loginToPod('https://roger.localhost:8443/');        

```

Now use isomorphic-git https://isomorphic-git.org/en/ or use the fs functions directly

the SolidFileSystem constructor can take a trunk instead of the default '/public/'.

```
window.fs = new SolidFileSystem(session, 'profile');
```
or to be right at the root

```
window.fs = new SolidFileSystem(session, '');
```

### Project Progress


* fs.readFile(path[, options], callback) : any text or arraybuffer as Uint8Array
* fs.writeFile(file, data[, options], callback) : any text or buffer
* fs.unlink(path, callback)  : any hard link
* fs.readdir(path[, options], callback) : returns array of Dirent's
* fs.mkdir(path[, mode], callback) : creates an empty container
* fs.rmdir(path, callback)  : deletes container, untested when there is deeper folders
* fs.stat(path[, options], callback) : retrieves a Stats with what's known about a file at this time. Error if not found
* fs.lstat(path[, options], callback) : not implemented
* fs.readlink(path[, options], callback) : not implemented
* fs.symlink(target, path[, type], callback) : not implemented

Major challenge is symlink emulation

### Testing 
The testing framework is cypress https://www.cypress.io/.

Currently need a node-solid-server(v5.6.16) standing up on localhost 8443 before running yarn test.

```
yarn test
```


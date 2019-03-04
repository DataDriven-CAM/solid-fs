# solid-fs
client side functionality of the node fs API interfacing to a solid pod

### Header scripts
```
  <script type="text/javascript" src="js/bundle.umd.min.js"></script>
  <script type="text/javascript" src="js/solid-auth-client.bundle.js"></script>
  <script type="text/javascript" src="js/N3.bundle.js"></script>
  <script type="text/javascript" src="js/solid-fs.js"></script>

```

### Pass webId to the SolidFileSystem
```
async function login(idp) {
  const session = await solid.auth.currentSession();
  if (!session)
    await solid.auth.login(idp);
  else
    alert(`Logged in as ${session.webId}`);
  window.fs = new SolidFileSystem(session.webId);
  // Initialize isomorphic-git with our new file system
  git.plugins.set('fs', window.fs);
}
login('https://roger.localhost:8443/');        

```

Now use isomorphic-git https://isomorphic-git.org/en/ or use the fs functions directly

the SolidFileSystem constructor can take a trunk instead of the default '/public/'.

```
window.fs = new SolidFileSystem(session.webId, 'profile');
```
or to be right at the root

```
window.fs = new SolidFileSystem(session.webId, '');
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

Currently use gulp to move some dependencies in for testing from 4 sibling working copies: [isomorphic-git](https://github.com/isomorphic-git/isomorphic-git), 
[solid-auth-client](https://github.com/solid/solid-auth-client), [rdflib.js](https://github.com/linkeddata/rdflib.js) and [N3.js](https://github.com/rdfjs/N3.js).

Currently need a node-solid-server(v5.0.0) standing up on localhost 8443 before running yarn test.

```
yarn test
```


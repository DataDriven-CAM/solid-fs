# solid-fs
client side functionality of the node fs API interfacing to a solid pod

###Header scripts
```
  <script type="text/javascript" src="js/bundle.umd.min.js"></script>
  <script type="text/javascript" src="js/solid-auth-client.bundle.js"></script>
  <script type="text/javascript" src="js/N3.bundle.js"></script>
  <script type="text/javascript" src="js/solid-fs.js"></script>

```

###Pass webId to the SolidFileSystem
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

###Progress


* fs.readFile(path[, options], callback) : any text
* fs.writeFile(file, data[, options], callback) : any text
* fs.unlink(path, callback)  : any hard link
* fs.readdir(path[, options], callback) : returns array of Dirent's
* fs.mkdir(path[, mode], callback) : creates an empty container
* fs.rmdir(path, callback)  : deletes container, untested when there is deeper folders
* fs.stat(path[, options], callback) : retrieves what's known about a file at this time
* fs.lstat(path[, options], callback) : not implemented
* fs.readlink(path[, options], callback) : not implemented
* fs.symlink(target, path[, type], callback) : not implemented

The two major challenges are symlink emulation and mapping to Content-Type and getting 
them writen and retrieved without modification
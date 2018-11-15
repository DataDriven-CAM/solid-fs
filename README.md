# solid-fs
client side functionality of the node fs API interfacing to a solid pod

Header scripts
```
  <script type="text/javascript" src="js/bundle.umd.min.js"></script>
  <script type="text/javascript" src="js/solid-auth-client.bundle.js"></script>
  <script type="text/javascript" src="js/N3.bundle.js"></script>
  <script type="text/javascript" src="js/solid-fs.js"></script>

```

Pass webId to the SolidFileSystem
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

Now use isomorhic-git https://isomorphic-git.org/en/ or use the fs functions directly

the SolidFileSystem constructor can take a trunk instead of the default '/public/'.

```
window.fs = new SolidFileSystem(session.webId, 'profile');
```
or to be right at the root

```
window.fs = new SolidFileSystem(session.webId, '');
```

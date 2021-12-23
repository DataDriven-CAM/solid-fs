//
class SolidFileSystem{

    constructor(session, trunk){
        this.session = session;
        this.webId = session.info.webId;
        
        this.trunk = (typeof trunk ==='undefined') ? '/public' : trunk;
        if(this.trunk.length>0){
            if(!this.trunk.startsWith('/'))trunk='/'+this.trunk;
            //if(!this.trunk.endsWith('/'))this.trunk+='/';
        }
        var url = new URL(`${this.webId}`);
        this.origin = url.origin;
        this.constants=Object.freeze({
                                "F_OK":1,
                                "R_OK":2,
                                "W_OK":4,
                                "X_OK": 8
                            });
    }

    access(path, m, cb){
    	var mode = (typeof m !== "function")? m : this.constants.F_OK,
        callback = (typeof m !== "function")? cb : m;
      this.session.fetch(this.origin+this.trunk+path, {
        method: 'OPTIONS'
      }).then(res => {return res;})
      .then((response) => {
          if(!response.ok && (response.status===404)){var err=new Error("Doesn't exist");err.code='ENOENT'; callback(err);};
          console.log(response);
      })
      .catch((error) => {var err=new Error("");callback(err);});
    }
    
    readFile(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        this.session.fetch(this.origin+this.trunk+"/"+path, {
           method: 'GET',
           headers:{
	    'Accept': 'Authorization, Origin, text/*, image/*, application/octet-stream'
	   }
        }).then((result)=>{
          if(result.ok){
              if(result.headers.has("Content-Type")){
                  if(result.headers.get("Content-Type")==="application/octet-stream"){
                      return result.arrayBuffer();
                  }
                  else return result.text();
              }
            return result.text();
          }
          else {
              if(path.endsWith(".pack"))console.log("Status: "+result.status+" "+result.statusText+" for "+path);
                          var err=new Error("ENOENT: no such file or directory");
                          //err.errno = -2;
                          //err.code='ENOENT';
                          err.syscall='stat';
                          err.path = path;
              
            callback("blah", null);
          }
        }).then((t)=>{
            if(typeof t === "string"){
              callback(null, t);
            }
            else if(typeof t === "object"){
                callback(null, new Uint8Array(t, 0, t.byteLength));
            }
            
        }).catch((e) => {console.error('Error:', JSON.stringify(e));
        }).catch((error) => {console.error('Error:', error);});
    }

    appendFile(file, data, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        console.log("appendFile "+file+" ");
    }

    copyFile(src, dest, fgs, cb){
    	var flags = (typeof fgs !== "function")? fgs : {},
        callback = (typeof fgs !== "function")? cb : fgs;
        console.log("copyFile "+src+" "+dest);
        this.readFile(src, (err, data)=>{
        if(err===null){
          this.writeFile(dest, data, (err)=>{
            if(err!==null){
              callback(err);
            }
            else callback(null);
          });
    
        }
        else callback(err);
      });
    }

    writeFile(file, data, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        var contentType = (typeof data ==="string") ? 'text/plain': 'application/octet-stream';
        var n=file.lastIndexOf("/");
        var _this = this;
        /*if(n=>0){
            var path=this.branch(file);
            async function f(){
            var p = new Promise((resolve, reject) => {
            _this.mkdir(path, (err) =>{
            });
            }).then((res) => { }).catch(() => { });
            await p;
            };
            f();
        }*/
        var _this = this;
        this.session.fetch(this.origin+this.trunk+"/"+file, {
           method: 'PUT', // or 'PUT'
           headers:{
	    'Content-Type': contentType
	   },
           body: data // data can be `string` or {object}!
           }).then((res) => {return res;})
        .then((response) => {callback(null);})
        .catch((error) => {callback('Error: '+JSON.stringify(error));});
    }

    unlink(path, callback){
      this.session.fetch(this.origin+this.trunk+"/"+path, {
        method: 'DELETE'
      }).then(res => {return res;})
      .then((response) => {callback(null);})
      .catch(error => callback('Error: '+JSON.stringify(error)));
    }

    leaf(ns){
      var str = ns;
      var n = str.lastIndexOf("/");
      var end = str.length;
      if(n+1===str.length){end=n-1;n=str.lastIndexOf("/", n-1);}
      return (n>=0) ? str.substr(n+1, end-n) : str;
    }

    branch(ns){
      var str = ns;
      var n = str.lastIndexOf("/");
      return (n>=0) ? str.substr(0, n+1) : str;
    }

    readdir(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        this.session.fetch(this.origin+this.trunk+"/"+path)
        .then((result)=>{

            if(result.ok){
            //console.log('path: '+path);
            //console.log('type: '+result.type);
            result.text().then((t)=>{
            var names = [];
            var entries = [];
            var parser = new N3.Parser();
            parser.parse(t, (error, quad, prefixes) => {
                if (quad){
                    var quadJSON = quad.toJSON();
            	if(quadJSON.subject.value!=='null'){
                            if(quadJSON.subject.value.startsWith("undefined"))quadJSON.subject.value=quadJSON.subject.value.substr(9);
                            if(quadJSON.subject.value.startsWith("null"))quadJSON.subject.value=quadJSON.subject.value.substr(4);
                            if(quadJSON.predicate.value.endsWith("#type") && quadJSON.object.value.endsWith("Resource") && !names.includes(quadJSON.subject.value)){
                              if(options.withFileTypes)entries.push(new SolidFileSystem.Dirent(quadJSON.subject.value, true));
                              else entries.push(quadJSON.subject.value);
                              names.push(quadJSON.subject.value);
                            }
                            else if(quadJSON.predicate.value.endsWith("#type") && quadJSON.object.value.endsWith("Container") && !names.includes(quadJSON.subject.value)){
                              if(options.withFileTypes)entries.push(new SolidFileSystem.Dirent(quadJSON.subject.value, false));
                              else entries.push(quadJSON.subject.value);
                              names.push(quadJSON.subject.value);
                            }
                    }
                }
                else{
                  //console.log("# That's all, folks!", prefixes);
                  callback(null, entries);
                }
              });
            }).catch((e) => {console.error('Error:', JSON.stringify(e));
                    });
              /*var fd = result.formData();
              for(var p of fd){
                console.log(fd[p]);
              }*/
            }
        }).catch((error) => {console.error('Error:', JSON.stringify(error));});
   
    }

    mkdir(path, m, cb){
      var mode = (typeof m !== "function")? m : {},
      callback = (typeof m !== "function")? cb : m;
      //if(!path.endsWith("/"))path+="/";
      var slugs = path.split("/");
      var n = 0;
      var _this = this;
      var branch ="";
      async function f(){
        while(n<slugs.length){
            let result = await _this.session.fetch(_this.origin+_this.trunk+branch+"/"+slugs[n]+"/");
            if(!result.ok && (result.status===401 || result.status===404)){
                let response = await _this.session.fetch(_this.origin+_this.trunk+branch, {
                   method: 'POST',
                   headers:{
                       'Content-Type': 'text/turtle',
        	           'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
                       'Slug':  slugs[n]
        	         }
               });
                if(!response.ok){
                console.log(response.ok);
                console.log(response.status);
                    callback(response.statusText);
                } else callback(null);
                
            }
            branch +="/"+slugs[n];
            n++;
        }
      };
      f();
    }

    rmdir(path, callback){
      this.session.fetch(this.origin+this.trunk+"/"+path, {
        method: 'DELETE'
      }).then(res => {return res;})
      .then((response) => {callback(null);})
      .catch(error => callback('Error: '+JSON.stringify(error)));
    }

    stat(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        //console.log(options);
        var leaf = this.leaf(this.origin+this.trunk+"/"+path);
      this.session.fetch(this.branch(this.origin+this.trunk+"/"+path)).then((response) => {
          if(response.ok)return response.text();
          else {var err=new Error(response.statusText); err.code='ENOENT'; err.errno = -2;
              if(typeof callback === "function")callback(err, null);}
          }).then((t)=>{
            var stat=new SolidFileSystem.Stats(leaf, true);
            var exists = false;
            var parser = new N3.Parser();
            //console.log(t);
            parser.parse(t, (error, quad, prefixes) => {
                if (quad){
                    var quadJSON = quad.toJSON();
            	if(quadJSON.subject.value!=='null'){
                            if(quadJSON.subject.value.startsWith("undefined"))quadJSON.subject.value=quadJSON.subject.value.substr(9);
                            if(quadJSON.subject.value.startsWith("null"))quadJSON.subject.value=quadJSON.subject.value.substr(4);
                            if(quadJSON.subject.value===leaf)exists=true;
                            if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("#mtime")){
                               stat.mtime = quadJSON.object.value;
                            }
                            else if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("#size")){
                               stat.size = quadJSON.object.value;
                            }
                            else if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("modified")){
                               stat.modified = quadJSON.object.value;
                            }
                            else if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("#type")){
                                //console.log(quadJSON.predicate.value+" "+quadJSON.object.value);
                               //stat.modified = quadJSON.object.value;
                            }
                            else  if(quadJSON.subject.value===leaf){
                                //console.log(quadJSON.predicate.value);
                            }
                    }
                }
                else{
                  //console.log("# That's all, folks!", prefixes);
                  if(exists){
                      if(typeof callback === "function")callback(null, stat);
                  }
                  else {
                          var err=new Error("ENOENT: no such file or directory");
                          err.errno = -2;
                          err.code='ENOENT';
                          err.syscall='stat';
                          err.path = path;
                          if(typeof callback === "function")callback(err, null);
                  }
                }
              });
          }).catch((error) => {
              if(typeof callback === "function")callback(error, null);});
    }

    lstat(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        console.log("lstat "+path+" ");
    }

    readlink(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        console.log("readlink "+path+" ");
    }
    symlink(target, path, t, cb){
    	var type = (typeof t !== "function")? t : {},
        callback = (typeof t !== "function")? cb : t;
        var n=path.lastIndexOf('/');
        console.log("symlink "+path+" ");
        this.session.fetch(this.origin+this.trunk+"/"+path.substr(0,n+1), {
           method: 'PUT', // or 'PUT'
           headers:{
            'Content-Type': 'text/turtle',
            'Location': this.origin+this.trunk+"/"+this.branch(target),
	    'Link': '<http://www.w3.org/ns/ldp#Resource>; rel="type"'
	   }
           }).then((res) => {return res;})
        .then((response) => {callback(null);})
        .catch(error => callback('Error: '+JSON.stringify(error)));

    }
    
}

SolidFileSystem.Dirent = class {
    constructor(name, isFile){
      this.name = name;
      this.directory = !isFile;
      this.file = isFile;
    }

    isBlockDevice(){return false;}
    isCharacterDevice(){return true;}
    isDirectory(){return this.directory;}
    isFIFO(){return false;}
    isFile(){return this.file;}
    isSocket(){return false;}
    isSymbolicLink(){return false;}
    
};

SolidFileSystem.Stats = class {
    constructor(name, isFile){
      this.name = name;
      this.directory = !isFile;
      this.file = isFile;
    }

    isBlockDevice(){return false;}
    isCharacterDevice(){return true;}
    isDirectory(){return this.directory;}
    isFIFO(){return false;}
    isFile(){return this.file;}
    isSocket(){return false;}
    isSymbolicLink(){return false;}
    
};


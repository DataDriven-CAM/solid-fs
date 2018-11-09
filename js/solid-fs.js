class SolidFileSystem{

    constructor(webId){
        this.webId=webId;
        var url = new URL(`${this.webId}`);
        this.origin = url.origin;
    }

    async readFile(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        solid.auth.fetch(this.origin+'/public/'+path, {
           method: 'GET',
           headers:{
	    'Accept': 'Authorization, Origin, text/*'
	   }
        }).then((result)=>{
          if(result.ok){
            return result.text();
          }
          else {
            callback("Status: "+result.status+" "+result.statusText+" for "+path, null);
          }
        }).then((t)=>{callback(null, t);}).catch((e) => {console.error('Error:', JSON.stringify(e));
        }).catch((error) => {console.error('Error:', error);});
    }

    async writeFile(file, data, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        solid.auth.fetch(this.origin+'/public/'+file, {
           method: 'PUT', // or 'PUT'
           headers:{
	    'Content-Type': 'text/plain',
            'Content-Length': data.length.toString()
	   },
           body: data // data can be `string` or {object}!
           }).then((res) => {return res;})
        .then((response) => {callback(null);})
        .catch((error) => {callback('Error: '+JSON.stringify(error));});
    }

    async unlink(path, callback){
      solid.auth.fetch(this.origin+'/public/'+path, {
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

    async readdir(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        solid.auth.fetch(this.origin+'/public/'+path)
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
            	if(quadJSON.subject.value!='null'){
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

    async mkdir(path, m, cb){
    	var mode = (typeof m !== "function")? m : {},
        callback = (typeof m !== "function")? cb : m;
        if(!path.endsWith("/"))path+="/";
        var n = path.indexOf("/");
        var prevN = 0;
        while(n>0){
        await solid.auth.fetch(this.origin+'/public/'+path.substr(0,n+1))
        .then((result)=>{
        if(!result.ok && result.status===404){
            //console.log(path.substr(0,prevN+1)+" | "+path.substr(prevN+1, path.indexOf("/", prevN+1)-(prevN+1))+" |");
        solid.auth.fetch(this.origin+'/public/'+path.substr(0,prevN+1), {
           method: 'POST',
           headers:{
               'Content-Type': 'text/turtle',
	           'Link': '<http://www.w3.org/ns/ldp#BasicContainer>; rel="type"',
               'Slug':  path.substr(prevN+1, path.indexOf("/", prevN+1)-(prevN+1))
	         }
           }).then((res) => {return res;})
        .then((response) => {callback(null);})
        .catch((error) => {callback('Error: '+JSON.stringify(error));});
            
        }
        }).catch((error) => {
        });
         prevN = n;
            n = path.indexOf("/", n+1);
            if(n===path.length)n=-1;
        }
    }

    async rmdir(path, callback){
      solid.auth.fetch(this.origin+'/public/'+path, {
        method: 'DELETE'
      }).then(res => {return res;})
      .then((response) => {callback(null);})
      .catch(error => callback('Error: '+JSON.stringify(error)));
    }

    async stat(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        var leaf = this.leaf(this.origin+'/public/'+path);
      solid.auth.fetch(this.branch(this.origin+'/public/'+path)).then((response) => {
          if(response.ok)return response.text();
          else callback("Status: "+response.status+" "+response.statusText+" for "+path, null);
          }).then((t)=>{
            var stat=new SolidFileSystem.Stats(leaf, true);
            var parser = new N3.Parser();
            parser.parse(t, (error, quad, prefixes) => {
                if (quad){
                    var quadJSON = quad.toJSON();
            	if(quadJSON.subject.value!='null'){
                            if(quadJSON.subject.value.startsWith("undefined"))quadJSON.subject.value=quadJSON.subject.value.substr(9);
                            if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("#mtime")){
                               stat.mtime = quadJSON.object.value;
                            }
                            else if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("#size")){
                               stat.size = quadJSON.object.value;
                            }
                            else if(quadJSON.subject.value===leaf && quadJSON.predicate.value.endsWith("modified")){
                               stat.modified = quadJSON.object.value;
                            }
                    }
                }
                else{
                  //console.log("# That's all, folks!", prefixes);
                  callback(null, stat);
                }
              });
          }).catch((error) => {callback('Error: '+JSON.stringify(error), null);});
    }

    async lstat(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        console.log("lstat "+path+" ");
    }

    async readlink(path, op, cb){
    	var options = (typeof op !== "function")? op : {},
        callback = (typeof op !== "function")? cb : op;
        console.log("readlink "+path+" ");
    }
    async symlink(target, path, t, cb){
    	var type = (typeof t !== "function")? t : {},
        callback = (typeof t !== "function")? cb : t;
        var n=path.lastIndexOf('/');
        console.log("symlink "+path+" ");
        solid.auth.fetch(this.origin+'/public/'+path.substr(0,n+1), {
           method: 'PUT', // or 'PUT'
           headers:{
            'Content-Type': 'text/turtle',
            'Location': this.origin+'/public/'+this.branch(target),
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
    
}

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
    
}


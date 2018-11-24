var os = require("os");
var net = require('net')
var http = require('http')
var Transform = require('stream').Transform
var url = require('url')
var fs = require('fs')
var path = require('path')
var zlib = require('zlib');

  var theServer=http.createServer(function (request, response) {
     try {
       var requestUrl = url.parse(request.url);
           //console.dir("requestUrl "+requestUrl);

       var resourcePath=path.normalize(requestUrl.pathname);
           //console.dir("resourcePath "+resourcePath);
       if(resourcePath.endsWith("solid-fs.js")){
           filePath = __dirname+"/.."+resourcePath;
           response.writeHead(200, { 'Content-Type': 'application/javascript' });
         var fileStream = fs.createReadStream(filePath)
         fileStream.pipe(response)
         fileStream.on('error',function(e) {
             response.writeHead(404)     // assume the file doesn't exist
             response.end()
         })
       }
       else{
           //console.dir("resourcePath "+resourcePath);
         var filePath = __dirname+"/examples"+resourcePath;
         console.dir("filePath "+filePath);
         if(filePath.endsWith(".html")){
            response.writeHead(200, { 'Content-Type': 'text/html' })
         console.dir("filePath "+filePath);
             
         }
         else if(filePath.endsWith(".js") || filePath.endsWith(".map")){
           filePath = __dirname+"/examples"+resourcePath;
           response.writeHead(200, { 'Content-Type': 'application/javascript' });
         }
         else response.writeHead(200);
         var fileStream = fs.createReadStream(filePath)
         fileStream.pipe(response)
         fileStream.on('error',function(e) {
             response.writeHead(404)     // assume the file doesn't exist
             response.end()
         })
       }
     } catch(e) {
       console.dir("e: "+e);
       response.writeHead(500)
       response.end()     // end the response so browsers don't hang
       console.log(e.stack)
     }
  });
  theServer.on('clientError', (err, socket) => {
    console.dir("client err: "+err);
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
  });  
  theServer.on('close', function () { console.dir("the server closed ")});
  theServer.listen(8888);

#!/usr/bin/env node

/*
 * Inspired by: http://stackoverflow.com/questions/4360060/video-streaming-with-html-5-via-node-js
 * Modified from https://gist.github.com/paolorossi/1993068
 */

var http = require('http')
  , fs = require('fs')
  , util = require('util')
  , url = require('url')

function dump_req(req) {
  return req.method + " " + req.url + " " + req.httpVersion + "\n" +
    JSON.stringify( req.headers )
}

function dump_res(res) {
  return res._header
}

http.createServer(function (req, res) {
  console.log("Request:", dump_req(req))

  //Get User request video index
  var query = url.parse(req.url, true).query;
  var videoIdx = query.videoid;
  console.log("query.videoid: " + query.videoid + ", videoIdx: " + videoIdx);

  //Test search video files in nodejs useing glob module
  var filePath;
  var glob = require("glob");
  var fileList = glob.sync("{**/*.mp4, *.mp4}", {cwd: "movie", mark: true});
  
  /*
  function(err, fileList){
    //glob callback
	if(err){
		console.log("Node glob error: " + err);
		return;
	}

	//work fine !!
	console.log(fileList);
	filePath = fileList[0];
	console.log(filePath);

  }
  */

  console.log("fileList: " + fileList);
  var videoFile = fileList[videoIdx];
  if(!videoFile){
  	videoFile = fileList[0];
  }
  console.log("fileVideo: " + videoFile);
  var lastIndex = videoFile.lastIndexOf("/") + 1;
  console.log("lastIndex: " + lastIndex);
  var videoName = videoFile.substring(lastIndex);
  //var videoName = videoFile.match("\*\.mp4");
  console.log("videoName: " + videoName);
  
  var videoNameList = [];
  for(var i = 0; i < fileList.length; i++){
    var video = fileList[i];
	var last = video.lastIndexOf("/");
	if(last){
	  videoNameList.push(video.substring(last + 1));
	}else{
	  videoNameList.push(video.substring(last));
	}
  }
  console.log("videoNameList: " + videoNameList);







  var path = 'movie/' + videoFile
    , stat = fs.statSync(path)
    , total = stat.size

  if (req.headers['range']) {
    var range = req.headers.range
      , parts = range.replace(/bytes=/, "").split("-")
      , partialstart = parts[0]
      , partialend = parts[1]
      , start = parseInt(partialstart, 10)
      , end = partialend ? parseInt(partialend, 10) : total-1
      , chunksize = (end-start)+1

    console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize)

    var file = fs.createReadStream(path, {start: start, end: end})

    res.writeHead(206
                 , { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total
                   , 'Accept-Ranges': 'bytes', 'Content-Length': chunksize
                   , 'Content-Type': 'video/mp4'
                   })
    file.pipe(res)
  }
  else {
    console.log('ALL: ' + total)
    res.writeHead(200
                 , { 'Content-Length': total
                   , 'Content-Type': 'video/mp4'
                   })
    fs.createReadStream(path).pipe(res)
  }

  console.log("Response", dump_res(res))
}).listen(1337)

console.log('Server running at http://localhost:1337/')

var head_title_text = "Streaming experiment"
  , body_header_text = "Welcome"
  , video_src = "http://localhost:1337/"
  , video_type = "video/mp4"
  , html_arr = [ "<html>"
               , "<head>"
               , "<title>" + head_title_text + "</title>"
               , "</head>"
               , "<body>"
               , "<h1>" + body_header_text + "</h1>"
               , "<video controls>"
               , "<source src=\"" + video_src + "\" type=\"" + video_type + "\">"
               , "</video>"
               , "</body>"
               , "</html>"]
  , html = html_arr.join("\n") + "\n"

http.createServer(function(req, res) {
  console.log("Request:", dump_req(req))
  res.end(html)
  console.log("Response", dump_res(res))
}).listen(8080)

console.log("Server running at http://localhost:8080/")

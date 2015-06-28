
//import a library for doing PUT & GET to webHDFS
//$.import("HanaHbase","Hbase");
$.import("zzzzzzzzztrial.trial.HadoopHbase1.webHDFS","webHDFS"); 

var webHDFS = $.zzzzzzztrial.trial.HadoopHbase1.webHDFS.webHDFS; //$.HanaHbase.Hbase;

// full path example (including prefix)  /webhdfs/v1/user/admin
var path = $.request.parameters.get("path") || "/user/admin"; 
var op = $.request.parameters.get("op") || "LISTSTATUS"; 
var webHDFSResponse;

switch ($.request.method) {
	case $.net.http.GET:
		
		if (op == "OPEN") {
			webHDFSResponse = webHDFS.GetDownload(path);
			
			//webHDFSResponse = typeof webHDFSResponse.body;
			break;	
		}
		else {
			webHDFSResponse = webHDFS.GetDirList(path);
			break;
		}
	/*	
	case $.net.http.PUT:	
		if (  $.request.headers.get("Content-Type") === 'application/json' ) {
			var reqBody = JSON.parse( $.request.body.asString() ); 
			HbaseResponse = Hbase.Put(HbaseTable, rowKey,reqBody);
		}
		else {
			HbaseResponse =	{"status": $.request.method  + " 'Content-Type' must be 'application/json' "};
		}
		break;  */
	default:
		webHDFSResponse = {"status": "Method "  + $.request.method  + " not Defined"};

}  


if (op == "OPEN") {
	//send the response as application/octet-stream
	$.response.contentType = "application/octet-stream";  //trigger download
	//Content-Disposition: attachment; filename="picture.png"
	//REPO_TEST_LPC.tgz
	$.response.setBody(webHDFSResponse.body);
}
else {
	// send the response as JSON
	$.response.contentType = "application/json";
	$.response.setBody(JSON.stringify(webHDFSResponse));
	
}

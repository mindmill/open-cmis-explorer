//create client
var client = new $.net.http.Client();
 
// Use webHDFS destination defined in webHDFS.xshttpdest  [Name Node]
var destName = "webHDFS";
var destNameNode = $.net.http.readDestination("zzzzzzzzztrial.trial.HadoopHbase1.webHDFS",destName);


//Use webHDFS destination defined in webHDFSdata.xshttpdest [Data Node]
var destData = "webHDFSdata";
var destDataNode = $.net.http.readDestination("zzzzzzzzztrial.trial.HadoopHbase1.webHDFS",destData);


//Next need to build up the url string expected by webHDFS REST service
var hBaseUrl;
 
var request;  
var response;

//get all the cookies and headers from the response
var co = [], he = [];
//get the body of the Response from webHDFS
var body = undefined;

var data;

function GetDirList (path) {
	//Currently hard coding DIRECTORY LISTING,  with HADOOP user name etc

	var webHDFSUrl = path  + "?op=LISTSTATUS&user.name=hue&doas=admin" ;

	request = new $.web.WebRequest($.net.http.GET, webHDFSUrl  );
	request.headers.set("Accept", "application/json");
 

	// send the request and synchronously get the response
	client.request(request, destNameNode);
	response = client.getResponse();
	
	splitRepsonse(response);
	
	var objBody;
	objBody = JSON.parse(body);
	
	return {"webHDFSUrl" : hBaseUrl, "status": response.status, "cookies": co, "headers": he, "body": objBody } ;

}

function GetDownload(path) {
	//Currently hard coding DOWNLOAD,  with HADOOP user name etc

	var webHDFSUrl = path  + "?op=OPEN&user.name=hue&doas=admin" ;

	request = new $.web.WebRequest($.net.http.GET, webHDFSUrl  );
	request.headers.set("Content-Type", "application/octet-stream");
 

	// send the request and synchronously get the response
	client.request(request, destNameNode);
	response = client.getResponse();
	
	
	var objBody;
	var location;
	for(var c in response.headers) {
		if (response.headers[c].name == "location" ) {
			objBody = response.headers[c].value;
			location = response.headers[c].value.substring(response.headers[c].value.indexOf(":50075")+6)
		}

    }

	request = new $.web.WebRequest($.net.http.GET, location );
	request.headers.set("Content-Type", "application/octet-stream");


	// send the request and synchronously get the response
	client.request(request, destDataNode);
	response = client.getResponse();
	
	//split response into components cookies, header and body
	splitRepsonse(response);
	

	return {"webHDFSUrl" : hBaseUrl, "status": response.status, "cookies": co, "headers": he, "body": body } ; //objBody


	
}

function PutCreate(path, data) {
	
	//explecting to create plain TEXT
	var webHDFSUrl = path  + "?op=CREATE&user.name=hue&doas=admin&overwrite=true" ;

	request = new $.web.WebRequest($.net.http.PUT, webHDFSUrl  );
	request.headers.set("Content-Type", "text/plain");
 

	// send the request and synchronously get the response
	client.request(request, destNameNode);
	response = client.getResponse();
	
	
	var objBody;
	var location;
	for(var c in response.headers) {
		if (response.headers[c].name == "location" ) {
			objBody = response.headers[c].value;
			location = response.headers[c].value.substring(response.headers[c].value.indexOf(":50075")+6)
		}

    }

	request = new $.web.WebRequest($.net.http.PUT, location );
	request.headers.set("Content-Type", "text/plain");
	request.setBody(data);

	client.request(request, destDataNode);
	response = client.getResponse();
	
	splitRepsonse(response);
		
	return {"webHDFSUrl" : hBaseUrl, "status": response.status, "cookies": co, "headers": he, "body": body } ; //objBody

	//return JSON.stringify(response);
	
}

//Function to split response into components: cookies, header and body
function splitRepsonse(response)	{

	//get all the cookies and headers from the response
	for(var c in response.cookies) {
	    co.push(response.cookies[c]);
	}
	 
	 
	for(var c in response.headers) {
	     he.push(response.headers[c]);
	}
	 
	 
	// get the body of the Response from Hbase
	if(!response.body)
	    body = "EMPTY";
	else
	    body = response.body.asString();
		
}

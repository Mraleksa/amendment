var client = require('http-api-client');
var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");

//db.run("DELETE FROM data");
var p = 0;
var formatTime = d3.timeFormat("%Y-%m-%d");
var myDate = new Date();
var dayOfMonth = myDate.getDate();
myDate.setDate(dayOfMonth - 3);
var start  = formatTime(myDate);
console.log(start);
var end  = formatTime(new Date());
console.log(end);
 
function piv(){  
p++;
client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts?offset='+start})
		.then(function (data) {
			var dataset = data.getJSON().data;		
			start = data.getJSON().next_page.offset;								
			console.log(start);
			
			return dataset;
		})	
		.then(function (dataset) {			
			dataset.forEach(function(item) {
				client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts/'+item.id})
					.then(function (data) {	
//////////SQLite//////////////

var change = data.getJSON().data.changes[data.getJSON().data.changes.length-1].rationaleTypes[0];
if(change=="itemPriceVariation"){
	var change0 = data.getJSON().data.changes[0].dateSigned;
	var dateSigned = data.getJSON().data.dateSigned;
	var amount = data.getJSON().data.value.amount;
	var tender_id = data.getJSON().data.tender_id;
	
	client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+tender_id})
					.then(function (data) {
							
	db.serialize(function() {	
	db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,dateSigned TEXT,change0 TEXT,tenderID TEXT,procuringEntity TEXT,numberOfBids INT,amount INT,cpv TEXT)");
	var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?)");
  	console.log(tender_id);
	statement.run(item.dateModified,dateSigned,change0,data.getJSON().data.tenderID,data.getJSON().data.procuringEntity.name,data.getJSON().data.numberOfBids,amount,data.getJSON().data.items[0].classification.description);
	statement.finalize();
	});
	
	})		
}
//////////SQLite//////////////	
					})
					.catch(function  (error) {
						//console.log("error_detale")				
					});  
			});	
		})
		.then(function () {	
			if (start.replace(/T.*/, "") != end) {piv ();}	
			else {
				console.log("STOP")
				//console.log(start.replace(/T.*/, ""))
			}							
		})
		.catch( function (error) {
			console.log("error")
			piv ();
		});   					
}

piv ();	

var client = require('http-api-client');
const fs = require('fs');
//var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");


var p = 0;

//var formatTime = d3.timeFormat("%Y-%m-%d");

var myDate = new Date();
var dayOfMonth = myDate.getDate();
myDate.setDate(dayOfMonth - 1);

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
						
			console.log(start)
			
			return dataset;
		})	
		.then(function (dataset) {	
		
			dataset.forEach(function(item) {
				client.request({url: 'https://public.api.openprocurement.org/api/2.3/contracts/'+item.id})
					.then(function (data) {
				
		


var change = data.getJSON().data.changes[data.getJSON().data.changes.length-1].rationaleTypes[0];

	

if(change=="itemPriceVariation"){
	
	var tender_id = data.getJSON().data.tender_id;
	
	client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+tender_id})
					.then(function (data) {
						
				db.serialize(function() {

  // Create new table
  db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,tenderID TEXT,procuringEntity TEXT,change TEXT,numberOfBids INT,amount INT,cpv TEXT)");

  
  // Insert a new record
  var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?)");
  
  statement.run(item.dateModified,data.getJSON().data.tenderID,data.getJSON().data.procuringEntity.name,change,data.getJSON().data.numberOfBids,data.getJSON().data.value.amount,data.getJSON().data.items[0].classification.description);
  
  statement.finalize();
});

		
						
	/*							
var res = "{'dateModified':'"+item.dateModified+"','tenderID':'"+data.getJSON().data.tenderID+"','procuringEntity':'"+data.getJSON().data.procuringEntity.name+"','change':'"+change+"','numberOfBids':'"+numberOfBids+"','amount':"+data.getJSON().data.value.amount+",'cpv':'"+data.getJSON().data.items[0].classification.description+"'},";
		fs.appendFile("changes.json", res);
						
						*/
						})
						

	}
	


	
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
			console.log(start.replace(/T.*/, ""))
	
		}		
							
		})
		.catch( function (error) {
			console.log("error")
			piv ();
		});   
		
					

}

piv ();	
 

   
//node_modules\http-api-client

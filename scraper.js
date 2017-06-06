var client = require('http-api-client');
var d3 = require("d3");
var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("data.sqlite");

//db.run("DELETE FROM data");
var p = 0; 
var formatTime = d3.timeFormat("%Y-%m-%d");
var myDate = new Date();
var dayOfMonth = myDate.getDate();
myDate.setDate(dayOfMonth - 4);
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
	
	//var lotIdContracts = data.getJSON().data.items[0].relatedLot;
	
	
	var dateSigned = data.getJSON().data.dateSigned;
	var amount = data.getJSON().data.value.amount;
	var tender_id = data.getJSON().data.tender_id;
	
	client.request({url: 'https://public.api.openprocurement.org/api/2.3/tenders/'+tender_id})
					.then(function (data) {
		
	//for (var i = 1; i <= data.getJSON().data.lots.length; i++) {
	//		if(lotIdContracts==data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].id){var startAmount =  data.getJSON().data.lots[data.getJSON().data.lots.length-(i)].value.amount};
			
	 //  }
	//var save = (startAmount-amount)/startAmount*100;
		var save = 100;
		
	db.serialize(function() {	
	db.run("CREATE TABLE IF NOT EXISTS data (dateModified TEXT,dateSigned TEXT,save INT,tenderID TEXT,procuringEntity TEXT,numberOfBids INT,amount INT,cpv TEXT)");
	var statement = db.prepare("INSERT INTO data VALUES (?,?,?,?,?,?,?,?)");
  	
	statement.run(item.dateModified,dateSigned,save,data.getJSON().data.tenderID,data.getJSON().data.procuringEntity.name,data.getJSON().data.numberOfBids,amount,data.getJSON().data.items[0].classification.description);
	//console.log(change);
	statement.finalize();
	});


	
	})
	.catch(function  (error) {
						//console.log("error_detale1")				
					});  
}
//////////SQLite//////////////	
					})
					.catch(function  (error) {
						//console.log("error_detale2")				
					});  
			});	
		})
		.catch(function  (error) {
						//console.log("error_detale3")				
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

var googleAuthData;
const {google} = require('googleapis');
function GoogleSheetGet(spreadsheetId, range, callback) {
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			var sheets = google.sheets('v4');
			var request = {
				auth: googleAuthData,				//from Initialize
				spreadsheetId: spreadsheetId,
				range: range,						//'sheet!A2:C'
				};
			sheets.spreadsheets.values.get(request, function(err, response) {
				if (err) {
					console.log('function GoogleSheetGet(%s,%s) : The API returned an error: \n' + err, spreadsheetId, range);
					reject(err)
				}
				var rows = response.data.values;
				if (rows.length == 0) {
					console.log('function GoogleSheetGet(%s,%s) : No data found.', spreadsheetId, range);
					resolve();
				} else {
					resolve(rows);
				}
			});
		}, 0);
	});	
}

function GoogleSheetUpdate(spreadsheetId, range, resource) {
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			var sheets = google.sheets('v4');
			var request = {
				auth: googleAuthData,				//from Initialize
				spreadsheetId: spreadsheetId,		//sheet ID
				range:encodeURI(range), 			//'Sheet!A2:C'
				valueInputOption: 'RAW',
				resource: {"values": resource}					//"values": arrayData
			};
			sheets.spreadsheets.values.update(request, function(err, response) {
				if (err) {
					console.log('function GoogleSheetUpdate(%s,%s,%s) : The API returned an error: \n' + err, spreadsheetId, range, resource);
					reject(err)
				} else {
					resolve("Successful");
				}
			});
		}, 0);
	});	
}

function GoogleSheetInsert(spreadsheetId, range, resource) {
	return new Promise(function(resolve, reject){
		setTimeout(function(){
			var sheets = google.sheets('v4');
			var request = {
				auth: googleAuthData,				//from Initialize
				spreadsheetId: spreadsheetId,		//sheet ID
				range:encodeURI(range), 			//'Sheet!A2:C'
				valueInputOption: 'RAW',
				resource: resource					//"values": arrayData
				};
			sheets.spreadsheets.values.append(request, function(err, response) {
				if (err) {
					console.log('function GoogleSheetInsert(%s,%s,%s) : The API returned an error: \n' + err, spreadsheetId, range, resource);
					reject(err)
				} else {
					resolve("Successful");
				}
			});
		}, 0);
	});	
}
function Initialize(json) {
	/*
	json = {
	"auth": auth
	}		*/
	googleAuthData = json.auth;
}
module.exports = {
	GoogleSheetGet,
	GoogleSheetUpdate,
	GoogleSheetInsert,
	Initialize
};

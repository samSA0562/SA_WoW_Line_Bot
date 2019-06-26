var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var jsonParser = bodyParser.json()
const CHANNELACCESSTOKEN = process.env.LINE_CHANNEL_ACCESSTOKEN
const CHANNELSECRET = process.env.LINE_CHANNEL_SECRET
const CREDENTIALSTOKEN = JSON.parse(process.env.GOOGLE_CREDENTIALS_TOKEN)
const GOOGLECLIENTID = process.env.GOOGLE_CLIENT_ID
const GOOGLECLIENTSECRET = process.env.GOOGLE_CLIENT_SECRET
const GOOGLEREDIRECTURL = process.env.GOOGLE_REDIRECTURL

const fs = require('fs');
const {google} = require('googleapis');
const {googleAuth} = require('google-auth-library');

var jsonAnalytics  = {"sheetId": ['10P5-QBiml5ogEOhk3Y9VD02-EBcF55zl4XpwyjuO7cI'], "sheetRange": [['replySheet!A2:D','LOG!A2:C']]},
	jsonGoogleapis = {"auth": ''};

// Load `*.js` under modules directory as properties
//  i.e., `User.js` will become `exports['User']` or `exports.User`
require('fs').readdirSync(__dirname + '/modules/').forEach(function(file) {
	if (file.match(/\.js$/) !== null && file !== 'index.js') {
		var name = file.replace('.js', '');
		exports[name] = require('./modules/' + file);
	}
});
authorize(Initialize);

var rplyOptions = {host: 'api.line.me', port: 443, path: '/v2/bot/message/reply', method: 'POST',
	headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + CHANNELACCESSTOKEN }
}
var sendOptions = {host: 'api.line.me', port: 443, path: '/v2/bot/message/push', method: 'POST',
	headers: { 'Content-Type': 'application/json', 'Authorization':'Bearer ' + CHANNELACCESSTOKEN }
}
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
app.get('/', function(req, res) {
	res.send('Welecome');
});
app.post('/', jsonParser, function(req, res) {
	let event = req.body.events[0];
	let type = event.type;
	let msgType = event.message.type;
	let msg = event.message.text;
	let rplyToken = event.replyToken;
	let rplyVal = {};
	console.log({"source":event.source, "message":event.message});
	try {
		rplyVal = handleEvent(event);
	} 
	catch(e) {
		console.log('catch error');
		console.log('Request error: ' + e.message);
	}
	//console.log(rplyVal)
	//把回應的內容,掉到msgToLine.js傳出去
	if (rplyVal) {
		exports.msgToLine.replyMsgToLine(rplyToken, rplyVal, rplyOptions); 
	} else {
		//console.log('Do not trigger'); 
	}
	res.send('ok');
});
app.get('/getGoogleSheet', function(req, res, next){
	Initialize(jsonGoogleapis.auth)
	res.send('Start Get Sheet!!');
});
app.get('/updateGoogleSheet', function(req, res, next){
	res.send('Start Update Sheet!!');
});
app.get('/SendMsgForm', function(req, res, next){
    res.sendfile('./views/SendMsgForm.html');
});
app.get('/cmdSend', function(req, res, next){
	//console.log(req.query);
	let cmdType = req.query.msgType,
	    cmdUser = req.query.User,
	    cmdText,
	    cmdStickerId, cmdPackageId,
	    cmdOriginalContentURL, cmdPreviewImageURL;
	if (!cmdUser) {
		res.send('None User!!');
	} else if (!cmdType) {
		res.send('None Type!!');
	} else {
		switch (cmdType) {
		case 'text':
			cmdText = req.query.text;
			exports.msgToLine.sendMsgToLine(cmdUser, {"type": cmdType,"text": cmdText}, sendOptions);
			break;
		case 'sticker':
			cmdStickerId = req.query.sticker[0]; cmdPackageId = req.query.sticker[1];
			exports.msgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "stickerId": cmdStickerId, "packageId": cmdPackageId}, sendOptions);
			break;
		case 'image':
			cmdOriginalContentURL = req.query.image[0]; cmdPreviewImageURL = req.query.image[1];
			exports.msgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "originalContentUrl": cmdOriginalContentURL, "previewImageUrl": cmdPreviewImageURL}, sendOptions);
			break;
		}
		res.json(req.query);
	}
});
app.post('/cmdSend', bodyParser, function(req, res) {
	//console.log(req);
	let cmdType = req.query.type,
		cmdUser = req.query.userId,
	    cmdMsg = req.query.msg,
	    cmdStickerId = req.query.stickerId,
	    cmdPackageId = req.query.packageId,
	    cmdOriginalContentURL = req.query.originalContentUrl,
	    cmdPreviewImageURL = req.query.previewImageUrl;
	if (!cmdUser) {
		res.send('None User!!');
	} else if (!cmdType) {
		res.send('None Type!!');
	} else {
		switch (cmdType) {
		case 'text':
			exports.msgToLine.sendMsgToLine(cmdUser, {"type": cmdType,"text": cmdMsg}, sendOptions);
			break;
		case 'sticker':
			exports.msgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "stickerId": cmdStickerId, "packageId": cmdPackageId}, sendOptions);
			break;
		case 'image':
			exports.msgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "originalContentUrl": cmdOriginalContentURL, "previewImageUrl": cmdPreviewImageURL}, sendOptions);
			break;
		}
		res.json(req.query);
	}
});
app.listen(app.get('port'), function() {
	console.log('KuKuParty is running on port', app.get('port'));
});

function handleEvent(event) {
	let sourceId;
	switch (event.source.type) {
	case 'user':
		sourceId = event.source.userId;
		break;
	case 'room':
		sourceId = event.source.roomId;
		break;
	case 'group':
		sourceId = event.source.groupId;
		break;
	}
	switch (event.type) {
	case 'message':
		const message = event.message;
		switch (message.type) {
		case 'text':
			return exports.analytics.textParseInput(sourceId, event.rplyToken, event.message.text); 
		case 'sticker':
			return exports.analytics.stickerParseInput(sourceId, event.rplyToken, event.message.stickerId, event.message.packageId); 
		case 'image':
			return exports.analytics.imageParseInput(); 
		default:
			break;
	}
	case 'follow':
		break;
	case 'unfollow':
		break;
	case 'join':
		break;
	case 'leave':
		break;
	case 'postback':
		break;
	case 'beacon':
		break;
	default:
		break;
	}
}
function authorize(callback) {
	var oauth2Client  = new google.auth.OAuth2(GOOGLECLIENTID, GOOGLECLIENTSECRET, GOOGLEREDIRECTURL);
	oauth2Client.credentials = CREDENTIALSTOKEN;
	jsonGoogleapis.auth = oauth2Client
	callback(oauth2Client);
}
function Initialize(auth) {
	exports.googleAPIs.Initialize(jsonGoogleapis);
	exports.analytics.Initialize(jsonAnalytics);
}

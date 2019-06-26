// Load `*.js` under al directory as properties
//  i.e., `User.js` will become `exports['User']` or `exports.User`
var jsonSheet={	
	"sheetId": [],
	"sheetRange": [],
	"sheetData": []
	},
	jsonParse={
	"textTrigger":[],	
	"textReply":[],		
	"stickerTrigger":[],
	"stickerReply":[],	
	"imageTrigger":[],	
	"imageReply":[]
	};
var msgLog=[[]];
var countMsgLog=0;

moduleDir = ['./modules/'] //All Module Directory name array
for (i=0;i<moduleDir.length;i++) {
	require('fs').readdirSync(moduleDir[i]).forEach(function(file) {
		if (file.match(/\.js$/) !== null && file !== 'index.js') {
			var name = file.replace('.js', '');
			exports[name] = require('.' + moduleDir[i] + file);
		}
	});
}
require('fs').readdirSync(__dirname + '/').forEach(function(file) {
	if (file.match(/\.js$/) !== null && file !== 'index.js') {
		var name = file.replace('.js', '');
		exports[name] = require('./' + file);
	}
});
function textParseInput(sourceId, rplyToken, inputStr) {
	for(index=0;index<msgLog.length;index++) {
		if(msgLog[index][0] == sourceId) {
			break;
		}
	}
	updateSheetLog(sourceId, inputStr);
	if (index == msgLog.length || msgLog[index][2] != "1") { //允許機器人回話才進來
		let msgSplitor = (/\S+/ig);	
		let arrayStr = inputStr.match(msgSplitor); //依空格切割字串為陣列
		for (i=0;i<jsonParse.textTrigger.length;i++) {
			for (j=0;j<jsonParse.textTrigger[i].length;j++) {
				if (inputStr.match(jsonParse.textTrigger[i][j]) != null) {
					return jsonParse.textReply[i][Math.floor((Math.random() * (jsonParse.textReply[i].length)) + 0)];
				}
			}
		}
		if (inputStr.match("請機器人安靜")) {
			msgLog[index][2] = "1";
			return {"type": "text", "text": "在下將會安靜一輩子，直到你請我繼續說話為止(關鍵字：請開啟機器人)！"};
		}
		if (inputStr.match("sourceid")) {
			return {"type": "text", "text": sourceId};
		}
		if (inputStr.match('機台狀態')) {
			return {"type":"flex","altText":"機台狀態...","contents":{"type":"bubble","styles":{"footer":{"separator":true}},"body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"當前狀態","weight":"bold","color":"#1DB446","size":"sm"},{"type":"text","text":"機台名稱","weight":"bold","size":"xxl","margin":"md"},{"type":"text","text":"機台位置","size":"xs","color":"#aaaaaa","wrap":true},{"type":"separator","margin":"xxl"},{"type":"box","layout":"vertical","margin":"xxl","spacing":"sm","contents":[{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"執行時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"90分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"待機時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"20分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"停機時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"3分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"xxl","contents":[{"type":"text","text":"完工次數","size":"sm","color":"#555555"},{"type":"text","text":"3","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"稼動率","size":"sm","color":"#555555"},{"type":"text","text":"13%","size":"sm","color":"#111111","align":"end"}]}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"md","contents":[{"type":"text","text":"索取時間","size":"xs","color":"#aaaaaa","flex":0},{"type":"text","text":"YYYY/MM/DD HH:mm:ss","color":"#aaaaaa","size":"xs","align":"end"}]}]}}}
		}
	}	
	
	if (msgLog[index][2] == "1" && inputStr.match("請開啟機器人")) {
		msgLog[index][2] = "0";
		return {"type": "text", "text": "又可以繼續喧嘩了！"};
	}
	return;
}
function stickerParseInput(sourceId, rplyToken, stickerId, packageId) {
//	updateSheetLog(sourceId, inputStr);
	for(index=0;index<msgLog.length;index++) {
		if(msgLog[index][0] == sourceId) {
			break;
		}
	}
	if (index == msgLog.length || msgLog[index][2] != "1") { //允許機器人回話才進來
		for (i=0;i<jsonParse.stickerTrigger.length;i++) {
			if (stickerId == jsonParse.stickerTrigger[i].stickerId && packageId == jsonParse.stickerTrigger[i].packageId) {
				return jsonParse.stickerReply[i][Math.floor((Math.random() * (jsonParse.stickerReply[i].length)) + 0)];
			}
		}
	}
	return;
}
function imageParseInput() {
	if (index == msgLog.length || msgLog[index][2] != "1") { //允許機器人回話才進來
//		updateSheetLog(sourceId, inputStr);
	}
	return;
}
function Initialize(json) {
	/*
	json = {
	"sheetId": [sheet,sheet],
	"sheetRange": [[range], [range]]
	}		
	*/
	jsonSheet.sheetId = json.sheetId;
	jsonSheet.sheetRange = json.sheetRange;
	for (i=0;i<jsonSheet.sheetId.length;i++)
		jsonSheet.sheetData[i] = [[]];
	getAllSheetsData();
}
function getAllSheetsData() {
	let step;
	let arrCmd=[];
	for(i=0;i<jsonSheet.sheetId.length;i++) {
		for(j=0;j<jsonSheet.sheetRange[i].length;j++) {
			arrCmd.push(exports.googleAPIs.GoogleSheetGet(jsonSheet.sheetId[i], jsonSheet.sheetRange[i][j]))
		}
	}
	Promise.all(arrCmd)
	.then(function (values) {
		let k=0;
		for(i=0;i<jsonSheet.sheetId.length;i++) {
			for(j=0;j<jsonSheet.sheetRange[i].length;j++) {
				jsonSheet.sheetData[i][j] = values[k];
				k++;
				if(k == values.length) {
					saveParameter();
				}
			}
		}
	})
	.catch(function (error) {
      console.log(error.message)
    })
	function saveParameter() {
		let arrData=[],
			arrReply=[],
			arrTrigger=[];
		if (jsonSheet.sheetData[0][0]) {
			for(k=0;k<jsonSheet.sheetData[0][0].length;k++) {
				switch (jsonSheet.sheetData[0][0][k][2]) {
				case 'text':
					arrData = jsonSheet.sheetData[0][0][k][3].split(",");
					for (x=0;x<arrData.length;x++)
						arrReply.push({"type": "text", "text": arrData[x]})
					break;
				case 'image':
					arrData = jsonSheet.sheetData[0][0][k][3].split(",");
					for (x=0;x<arrData.length;x++)
						arrData[x] = arrData[x].split("&&");
					for (y=0;y<arrData.length;y++)
						arrReply.push({"type": "image", "originalContentUrl": arrData[y][0], "previewImageUrl": arrData[y][1]});
					break;
				case 'sticker':
					arrData = jsonSheet.sheetData[0][0][k][3].split(",");
					for (x=0;x<arrData.length;x++)
						arrData[x] = arrData[x].split("&&");
					for (y=0;y<arrData.length;y++)
						arrReply.push({"type": "sticker", "packageId": arrData[y][0], "stickerId": arrData[y][1]});
					break;
				}	
				switch(jsonSheet.sheetData[0][0][k][0]) {
				case 'text':
					jsonParse.textTrigger.push(jsonSheet.sheetData[0][0][k][1].split(","));
					jsonParse.textReply.push(arrReply);
					break;
				case 'image':
					arrTrigger = jsonSheet.sheetData[0][0][k][1].split(",");
					for (x=0;x<arrTrigger.length;x++)
						arrTrigger[x] = arrTrigger[x].split("&&");
					for (y=0;y<arrtrigger.length;y++)
						jsonParse.imageTrigger.push({"originalContentUrl": arrtrigger[y][0], "previewImageUrl": arrtrigger[y][1]});
					jsonParse.imageReply.push(arrReply);
					break;
				case 'sticker':
					arrTrigger = jsonSheet.sheetData[0][0][k][1].split(",");
					for (x=0;x<arrTrigger.length;x++)
						arrTrigger[x] = arrTrigger[x].split("&&");
					for (y=0;y<arrTrigger.length;y++)
						jsonParse.stickerTrigger.push({"packageId": arrTrigger[y][0], "stickerId": arrTrigger[y][1]});
					jsonParse.stickerReply.push(arrReply);
					break;
				}
				arrReply = []
			}
		}
		msgLog = jsonSheet.sheetData[0][1];
	}
}
function updateAllSheetsData() {
	for(i=0;i<jsonSheet.sheetId.length;i++){
		for(j=0;jsonSheet.sheetData[i].length;j++) {
			exports.googleAPIs.GoogleSheetUpdate(jsonSheet.sheetId[i], jsonSheet.sheetRange[i][j], {"values": jsonSheet.sheetData[i][j]});
		}
	}
}
function updateSheetLog(sourceId, inputStr) {
	for(index=0;index<msgLog.length;index++) {
		if(msgLog[index][0] == sourceId) {
			msgLog[index][1] = inputStr;
			break;
		}
	}
	if (index == msgLog.length) {
		msgLog[index] = [sourceId, inputStr, "0"];
	}	
	
	if (countMsgLog > 10) {
		exports.googleAPIs.GoogleSheetUpdate(jsonSheet.sheetId[0], jsonSheet.sheetRange[0][1], msgLog);
		countMsgLog=0;
	} else {
		countMsgLog++;
	}
}
module.exports = {
	textParseInput,
	stickerParseInput,
	imageParseInput,
	Initialize,
	getAllSheetsData
};


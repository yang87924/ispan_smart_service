'use strict';
const
    config = require('config'),
    express = require('express'),
    mysql = require('mysql');

let app = express();
let port = process.env.PORT || process.env.port || 5001;
app.set('port', port);
app.use(express.json());

app.listen(app.get('port'), function () {
    //console.log('[app.listen] Node app is running on port', app.get('port'));
});

module.exports = app;

// const MOVIE_API_KEY = config.get('MovieDB_API_Key');

let config_db = {
    host:'localhost',
    user: config.get('user'),
    password: config.get('password'),
    database: 'ec-bot',
    port: 3306
};

const conn = new mysql.createConnection(config_db);
conn.connect(
    function(err){
        if(err){
            //console.log("!!! Cannot connect !!! Error:");
            throw err;
        }else{
            //console.log("^__^ Connection established.");
        }
    }
);


app.post('/webhook', function (req, res) {
    //console.log("[webhook] in");
    let data = req.body;
    let queryCategory = data.queryResult.parameters['Category'];
    //console.log("queryCategory : ", queryCategory);
    //兩種查詢條件
    //1.類別查詢：外套/上衣/下身/內衣
    //2.熱門
    let queryFilter = "";
    if(queryCategory == "熱門"){
        queryFilter = "IsHot = 1";
    }else{
        queryFilter = `Category = '${queryCategory}'`;
    }

    conn.query("SELECT * FROM `product-db` where "+queryFilter,
    function(err, body, fields){
        if(err) throw err;
        else console.log('Selected ' + body.length + ' row(s).');
        sendCards(body, res);
    });
});
function sendCardsOld(body, res){
    console.log("[sendCards] in");
    let thisFulfillmentMessages = [];
    for(let x=0;x<body.length;x++){
        let thisObject = {};
        thisObject.card = {};
        thisObject.card.title = body[x].Name;
        thisObject.card.subtitle = body[x].Category;
        thisObject.card.imageUri = body[x].Photo;
        thisObject.card.buttons = [
            {
                text:"看大圖",
                postback:body[x].Photo
            }
        ];
        thisFulfillmentMessages.push(thisObject);
    }
    res.json({fulfillmentMessages:thisFulfillmentMessages});
}

function sendCards(body, res) {
    console.log('[sendCards] In');
    console.log('[body]', JSON.stringify(body));
    var thisFulfillmentMessages = [];

    //Line Sticker Object
    let stickerObject = {
        payload:{
            line:{
                "type": "sticker",
                "packageId": "8515",
                "stickerId": "16581257"
            }
        }
    };

    thisFulfillmentMessages.push(stickerObject);

    //Line Video Object
    let videoObject = {
        payload: {
            line: {
                "type": "video",
                "originalContentUrl": "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                "previewImageUrl": "https://m.media-amazon.com/images/M/MV5BMzIwZTBhNDUtNmM5NC00OTNjLTk0MGMtZDA0MGVjYzVmZDEyXkEyXkFqcGdeQXVyNDgyODgxNjE@._V1_.jpg",
                "trackingId": "1"
            }
        }
    };

    thisFulfillmentMessages.push(videoObject);

     //line Location Object 
     let LocationObject = {
        payload:{
            line:{
                "type": "location",
                "title": "資展國際-臺中",
                "address": "408台中市南屯區公益路二段51號",
                "latitude": 24.150809718662124, 
                "longitude": 120.65104635767072
        }
    }
    }
    thisFulfillmentMessages.push(LocationObject)

     //line Flex Object 
     let FlexObject = {
        payload:{
            line:{
                "type": "flex",
                "altText": "this is a flex message",
                "contents": {
                    "type": "bubble",
                    "header": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "EEIT64-洪偉哲"
                        }
                      ]
                    },
                    "body": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "image",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/01_1_cafe.png"
                        }
                      ]
                    },
                    "footer": {
                      "type": "box",
                      "layout": "vertical",
                      "contents": [
                        {
                          "type": "text",
                          "text": "hello, world"
                        }
                      ]
                    }
                  }
        }
    }
    }
    thisFulfillmentMessages.push(FlexObject)
    
    var thisLineObject = {
        payload: {
            line: {
                type: "template",
                altText: "Carousel Card",
                template: {
                    type: "carousel",
                    columns: []
                }
            }
        }
    };

    for (var x = 0; x < body.length; x++) {
        var thisObject = {};
        thisObject.thumbnailImageUrl = body[x].Photo;
        thisObject.imageBackgroundColor = "#FFFFFF";
        thisObject.title = body[x].Name;
        thisObject.text = body[x].Category + " $" + body[x].Price;
        thisObject.defaultAction = {};
        thisObject.defaultAction.type = "uri";
        thisObject.defaultAction.label = "view detail";
        thisObject.defaultAction.uri = body[x].Photo;
        thisObject.actions = [];
        var thisActionObject = {};
        thisActionObject.type = "uri";
        thisActionObject.label = "view detail";
        thisActionObject.uri = body[x].Photo;
        thisObject.actions.push(thisActionObject);
        thisLineObject.payload.line.template.columns.push(thisObject);
    }

    thisFulfillmentMessages.push(thisLineObject);
    var responseObject = {
        fulfillmentMessages: thisFulfillmentMessages
    };
    res.json(responseObject);
}
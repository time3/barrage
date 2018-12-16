let webSocket = require('ws');
//redis的客户端
let redis = require('redis');
let client = redis.createClient();
let ws = new webSocket.Server({port:3000});
//原生的websocket就两个常用的方法 on('message') send()
let clientArr = [];
ws.on('connection', function(ws){
    clientArr.push(ws);
    client.lrange('barrages', 0, -1, function(err, applies){
        // console.log(applies)
        applies = applies.map(item => JSON.parse(item));
        ws.send(JSON.stringify({
            type: 'INIT',
            data: applies
        }))
    })
    ws.on('message', function(data){
        //data是字符串
        //"{value, time,color,speed}"
        client.rpush('barrages', data);
        clientArr.forEach(ces => {
            ces.send(JSON.stringify({type: 'ADD', data: JSON.parse(data)}));
        })
        
    })
    ws.on('close', function(){
        clientArr = clientArr.filter(client => client!=ws);  
    })
})
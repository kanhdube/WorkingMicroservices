var amqp = require('amqplib/callback_api');    
function sendrsrv(rsrv,que,callback) {    
  amqp.connect('amqp://localhost',function(err,conn) {
	if (err) { console.log('error:', err) }
	else {
		console.log('Connection to RabbitMq is successful');
		conn.createChannel(function(err, ch){
			if(err) { callback(err); }
			else { callback(undefined, 'done');}
			var q = que;
			ch.assertQueue(q,{durable:false});
			ch.sendToQueue(q, new Buffer(rsrv));
			});
	}
	//setTimeout(function() {conn.close(); process.exit(0)}, 500);
  });
}
function getrsrv(que, callback) {    
    amqp.connect('amqp://localhost',function(err,conn){
			conn.createChannel(function(err, ch) {
			var q = que;
			ch.assertQueue(q, {durable:false});
			console.log('Waiting for messages in queue');
			ch.consume(q, function(msg){
			var clone = msg.content;
			//var cloned = JSON.parse(clone.replace(/_/g,""));
			var cloned = JSON.parse(clone);
			console.log(' [x] Recieved clone %s', clone);
			console.log(' [x] Recieved cloned %s', cloned.folioNum);
			var resultrsrv = {
					folioNum:cloned.folioNum,
    			status:cloned.status
      		};
			exports.resultrsrv = resultrsrv;
			callback('done');
			}, {noAck:true});
		
			});
	});
}
exports.sendrsrv = sendrsrv;
exports.getrsrv = getrsrv;
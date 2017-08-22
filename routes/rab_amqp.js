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

exports.sendrsrv = sendrsrv;
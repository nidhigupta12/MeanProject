var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var workflowSchema = new Schema({
								stage:{type: Number, required: true},
								createdDate: {type:Date},
								createdDateUTC: {type:Date, default: Date.now},
								transactionHash:{type: String}
						});


module.exports = mongoose.model('lcContract.workflow', workflowSchema);

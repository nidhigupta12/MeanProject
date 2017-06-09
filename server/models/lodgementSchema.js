var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lodgementSchema = new Schema({
								fileName:{type: String},
                ipfsDocHash:{type: String},
								createdDateUTC: {type:Date, default: Date.now},
								fileType: {type: String, enum: ['invoice','others']}
						});


module.exports = mongoose.model('lcContract.lodgementDocuments', lodgementSchema);

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var roles = new Schema({
								roleId:{type: Number, required: true},
                roleName:{type: String, required: true},
								createdDate: {type:Date, default: Date.now}
						});


module.exports = mongoose.model('roles', roles);

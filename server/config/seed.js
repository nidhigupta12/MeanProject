/**
 * @author hitjoshi@deloitte.com
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';


var User = require('../models/userSchema.js');
var role = require('../models/roles.js');



User.find({}).then(function(users) {
    if (users.length > 0) {
        // do not populate Again
        console.log('Users Already populated');
    } else {

        role.remove({}, function(err, removed) {
            console.log("Roles removed");
        });
        var initiaterRole = new role({
            roleId: 100,
            roleName: "INITIATOR"
        });

        var issueBankRole = new role({
            roleId: 200,
            roleName: "ISSUE_BANK"
        });

        var advisingRole = new role({
            roleId: 300,
            roleName: "ADVISING_BANK"
        });

        var beneficiaryRole = new role({
            roleId: 400,
            roleName: "BENEFICIARY"
        });

        var presentingBankRole = new role({
            roleId: 500,
            roleName: "PRESENTING_BANK"
        });

        role.create(
                initiaterRole,
                advisingRole,
                issueBankRole,
                beneficiaryRole,
                presentingBankRole
            )
            .then(() => {
                console.log('finished populating roles');
            });



        var issBank1 = new User({
            provider: 'local',
            role: [
                issueBankRole._id,
                presentingBankRole._id
            ],
            name: 'isb_pre_bank',
            email: 'isbbank@issuingbank.com',
            entity: 'Issue/Presenting Bank Ltd',
            address: "Mumbai_1",
            password: 'test',
            branch: "Powai Branch"
        });

        var advBank1 = new User({
            provider: 'local',
            role: [
                advisingRole._id,
                presentingBankRole._id
            ],
            name: 'adv_pre_bank',
            email: 'advbank1@advisingbank.com',
            entity: 'Advising/Presenting Bank Ltd',
            address: "Delhi_2",
            password: 'test',
            branch: "CP Branch"
        });

        var advBank2 = new User({
            provider: 'local',
            role: [advisingRole._id,
                  presentingBankRole._id,
                  issueBankRole._id
            ],
            name: 'adv_iss_pre_bank',
            email: 'advbank2@advisingbank.com',
            entity: 'Advising/Presenting/Issue Bank Ltd',
            address: "Delhi_1",
            password: 'test',
            branch: "CP Branch"
        });

        var presentingBnk1 = new User({
            provider: 'local',
            role: [
              presentingBankRole._id,
              issueBankRole._id
            ],
            name: 'pre_issueBank1',
            email: 'preBank1@presentingbank.com',
            entity: 'Presenting/Issue Bank Ltd',
            address: "Chennai_1",
            password: 'test',
            branch: "Adyar Branch"
        });

        var applicant1 = new User({
            provider: 'local',
            name: 'abcCorpAndBNF_1',
            email: 'abcCorp1@buyer.com',
            address: "Bangalore_2",
            role: [
                  initiaterRole._id,
                  beneficiaryRole._id],
            password: 'test',
            accountDetail: {
                accountNo: "IssBanIMP10097998",
                bankDetail: issBank1._id
            }
        });

        var applicant2 = new User({
            provider: 'local',
            name: 'abcCorp_2',
            email: 'abcCorp2@buyer.com',
            address: "Bangalore_1",
            role: [initiaterRole._id],
            password: 'test',
            accountDetail: {
                accountNo: "IssIMP10097999",
                bankDetail: issBank1._id
            }
        });

        var beneficiary1 = new User({
            provider: 'local',
            role: [beneficiaryRole._id],
            name: 'bnfCorp1',
            email: 'bnfCorp1@beneficiary.com',
            address: "Hyderabad_3",
            password: 'test',
            accountDetail: {
                accountNo: "Pre2EXP10097999",
                bankDetail: presentingBnk1._id
            }
        });

        var beneficiary2 = new User({
            provider: 'local',
            role: [beneficiaryRole._id,
                  initiaterRole._id],
            name: 'bnfCorp2 Applciant',
            email: 'bnfCorp2@beneficiary.com',
            address: "Hyderabad_2",
            password: 'test',
            accountDetail: {
                accountNo: "PreEXP10097999",
                bankDetail: presentingBnk1._id
            }
        });


        User.create(
                presentingBnk1,
                issBank1,
                advBank1,
                advBank2,
                applicant1,
                applicant2,
                beneficiary1,
                beneficiary2

            )
            .then(() => {
                console.log('finished populating users');
            });
    }
}, function() {
    console.log('Failed to Load Auto Populate Users');
});

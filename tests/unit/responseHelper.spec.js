const { expect } = require('chai');
const responseHelper = require('../../src/responseHelper');

describe('responseHelper', () => {
    describe('set', () => {
        it('should return hasError=false and a object that represents data', () => {
            const requestId = 'sessiontoken';
            const userToken = 'usertoken';
            const testReq = {
                get: (key) => {
                    if (key === 'X-Session-Token') return requestId;
                    if (key === 'userToken') return userToken;
                    return null;
                }
            };

            const testData = {
                testField1: 'Test field 1',
                testField2: 'Test field 2',
                testField3: {
                    testField3_1: 'Test field 3_1',
                    testField3_2: 'Test field 3_2'
                }
            };

            const result = responseHelper.set(testReq, testData);
            expect(result.requestId).to.equal(requestId);
            expect(result.userToken).to.equal(userToken);
            expect(result.data.testField1).to.equal(testData.testField1);
            expect(result.data.testField3.testField3_2).to.equal(testData.testField3.testField3_2);
        });
    });

});
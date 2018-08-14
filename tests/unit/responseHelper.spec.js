import responseHelper from '../../src/responseHelper';

describe('responseHelper', () => {
    describe('createData', () => {
        it('should return hasError=false and a object that represents data', () => {
            const testData = {
                testField1: 'Test field 1',
                testField2: 'Test field 2',
                testField3: {
                    testField3_1: 'Test field 3_1',
                    testField3_2: 'Test field 3_2'
                }
            };

            const result = responseHelper.createData(testData);

            expect(result.hasError).to.be.false;
            expect(result.data.testField1).to.equal(testData.testField1);
            expect(result.data.testField3.testField3_2).to.equal(testData.testField3.testField3_2);
        });
    });

});
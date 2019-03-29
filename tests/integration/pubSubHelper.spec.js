const pubSubHelper = require('../../src/pubSubHelper');
const KEYS = require('../../src/pubSubKeys');

//NOTE: This integration test is disabled now due to env setup is required.
xdescribe('pubSubHelper', () => {
    const appName = 'myApp';
    const gcpProjectName = 'built-dev-203803';
    const topicName = 'swms-test';
    const subscriptionName = 'swms-test-sub';

    const testAttrs = {
        requestId: '1242323',
        type: pubSubHelper.ATTR_TYPE.POST,
        key: KEYS.POST_AN_USER
    };
    const testData = {
        testField1: 'Test field 1',
        testField2: 'Test field 2',
        testField3: {
            testField3_1: 'Test field 3_1',
            testField3_2: 'Test field 3_2'
        }
    };

    pubSubHelper.setup({ appName, gcpProjectName, topicName, subscriptionName });

    describe('publish', () => {
        it('should return messageId when published', (done) => {
            pubSubHelper.publish(testData, testAttrs)
                .then(messageId => {
                    expect(messageId).to.not.be.empty;
                })
                .then(done, done);
        });
    });

    describe('subscribe', () => {
        it('should return data and attributes in callback', (done) => {
            let hasDoneCalled = false;
            pubSubHelper.subscribe((data, attr) => {
                expect(data).to.eql(testData);
                expect(attr).to.eql(testAttrs);
                if (!hasDoneCalled) {
                    hasDoneCalled = true;
                    done();
                }
            }, () => {});
        });
    });
});

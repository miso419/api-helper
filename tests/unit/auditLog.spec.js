import AuditLog from '../../src/auditLog';

const auditLog = new AuditLog('http://localhost:5555');

describe('AuditLog', () => {

    describe('getUserLogObj', () => {

        it('should throw SyntaxError when no tableName is provided', () => {
            try {
                auditLog.getUserLogObj();
                throw new Error('should not reach here!');
            } catch(e) {
                expect(e).to.be.an.instanceof(SyntaxError);
            }
        });

        it('should throw SyntaxError when no recordId is provided', () => {
            try {
                auditLog.getUserLogObj('user');
                throw new Error('should not reach here!');
            } catch(e) {
                expect(e).to.be.an.instanceof(SyntaxError);
            }
        });

        it('should throw SyntaxError when no actionType is provided', () => {
            try {
                auditLog.getUserLogObj('user', 123);
                throw new Error('should not reach here!');
            } catch(e) {
                expect(e).to.be.an.instanceof(SyntaxError);
            }
        });

        it('should throw SyntaxError when actionType is invalid', () => {
            try {
                auditLog.getUserLogObj('user', 123, 'what');
                throw new Error('should not reach here!');
            } catch(e) {
                expect(e).to.be.an.instanceof(SyntaxError);
            }
        });

        it('should throw SyntaxError when no newFields is provided', () => {
            try {
                auditLog.getUserLogObj('user', 123, 'craete', {});
                throw new Error('should not reach here!');
            } catch(e) {
                expect(e).to.be.an.instanceof(SyntaxError);
            }
        });

        it('should throw SyntaxError when actionType is update and oldFields is null', () => {
            try {
                auditLog.getUserLogObj('user', 123, 'update');
                throw new Error('should not reach here!');
            } catch(e) {
                expect(e).to.be.an.instanceof(SyntaxError);
            }
        });

        it('should return a log object when all parameters are properly set', () => {
            const result = auditLog.getUserLogObj('user', 123, 'update', { test: 'test' }, { test: 'test2' });
            expect(result.tableName).to.equal('user');
            expect(result.recordId).to.equal(123);
            expect(result.actionType).to.equal('update');
            expect(result.fields).to.lengthOf(1);
        });
    });

});
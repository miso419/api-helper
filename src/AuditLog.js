import deep from 'deep-diff';
import requestHelper from './requestHelper';

export default class {
    constructor(auditServiceEndpoint) {
        if (!auditServiceEndpoint) {
            throw new SyntaxError('The auditServiceEndpoint parameter is required.');
        }

        this.auditServiceEndpoint = auditServiceEndpoint;
        this.diff = deep.diff;
        /*eslint-disable */
        this.actionTypes = {
            create: 'create',
            update: 'update',
            delete: 'delete',
            read: 'read'
        };
        /*eslint-enable */
        this.actionTypesAll = [
            this.actionTypes.create,
            this.actionTypes.update,
            this.actionTypes.delete,
            this.actionTypes.read
        ];
    }

    getUserLogObj(tableName, recordId, actionType, oldFields, newFields) {
        if (!tableName) {
            throw new SyntaxError('The tableName field is required in each objects.');
        }
        if (!recordId) {
            throw new SyntaxError('The recordId field is required in each objects.');
        }
        if (!actionType) {
            throw new SyntaxError('The actionType field is required in each objects.');
        }
        if (!this.actionTypesAll.includes(actionType)) {
            throw new SyntaxError(`The actionType must be either ${this.actionTypesAll.join(', ')}.`);
        }
        if (!newFields) {
            throw new SyntaxError('The new field is required in each objects.');
        }
        if (actionType === this.actionTypes.update && !oldFields) {
            throw new SyntaxError('The old field is required when the action type is update.');
        }

        return {
            tableName,
            recordId,
            actionType,
            fields: this.diff(oldFields, newFields)
        };
    }

    callAuditServiceToCreate(requestId, log) {
        return requestHelper.post(
            this.auditServiceEndpoint + '/v1/user-audit/create',
            requestId,
            log);
    }

    createUserLogs(requestId, userId, ...objects) {
        const requestBody = {
            userId,
            log: objects.map(obj => this.getUserLogObj(obj.tableName, obj.recordId, obj.actionType, obj.old, obj.new))
        };
        return this.callAuditServiceToCreate(requestId, requestBody);
    }

    createUserLogForCreate(requestId, userId, tableName, recordId, newObject) {
        const requestBody = {
            userId,
            log: [ this.getUserLogObj(tableName, recordId, this.actionTypes.create, {}, newObject) ]
        };
        return this.callAuditServiceToCreate(requestId, requestBody);
    }

    createUserLogForUpdate(requestId, userId, tableName, recordId, oldObject, newObject) {
        const requestBody = {
            userId,
            log: [ this.getUserLogObj(tableName, recordId, this.actionTypes.update, oldObject, newObject) ]
        };
        return this.callAuditServiceToCreate(requestId, requestBody);
    }

    createUserLogForDelete(requestId, userId, tableName, recordId) {
        const requestBody = {
            userId,
            log: [ this.getUserLogObj(tableName, recordId, this.actionTypes.delete, {}, {}) ]
        };
        return this.callAuditServiceToCreate(requestId, requestBody);
    }
}

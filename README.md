# API Helper

Helpers that are commonly used in microservices.

## Setup
```
npm install @builtlabs/api-helper --save
```

## Table of contents

- [AuditLog](#audit-log)
- [cacheHelper](#cache-helper)
- [responseHelper](#response-helper)
- [requestHelper](#request-helper)

---

## AuditLog

It helps to extract changes from old and new JSON objects and log them via the Audit Service.
Currently supports user level actions only.

### Simple usages

First, create new AuditLog instance with the Audit Service endpoint (Using `config` is recommended instead of hard-coding).
For single table, you can simply call `createUserLogForCreate`, `createUserLogForUpdate` or `createUserLogForDelete` accordingly.
* requestId: (string) Request ID from the caller
* userId: (integer) User ID who requires the action
* tableName: (string) DB table name to be affected
* recordId: (integer) DB table record ID to be affected
* oldObject: (object) Old object before changes
* newObject: (object) New object after changes

```js
import { AuditLog } from '@builtlabs/api-helper';
const auditLog = new AuditLog('https://audit-service-dev.built.com.au', 'project name');

function createSubdomain(requestId, userId, organisationId, subdomain) {
    return userManager.getUser(userId)
        .then(user => validateSubdomain(subdomain))
        .then(() => Organisation.update({ code: subdomain }, { where: { id: organisationId } }))
        .then(() => auditLog.createUserLogForUpdate(requestId, userId, 'Organisation', organisationId, {}, { code: subdomain }));
}
```
[back to top](#table-of-contents)

---

## cacheHelper

It helps to use Redis cache.

### Usages

#### 1. setup
Create a Redis connection. It must be called in server.js to initialise cacheHelper. 

```js
import config from 'config';
import Server from '@builtlabs/microservice-base';
import { cacheHelper } from '@builtlabs/api-helper';
import routes from './routes';

cacheHelper.setup(config.redis.endpoint);

export default function() {
    const server = new Server({
        name: 'ACCOUNT-SERVICE',
        localPort: 4002,    //DO NOT CHANGE. USED BY OTHER SERVICES FOR LOCAL TESTS.
        logConfig: { ...config.cloudWatch },
        docs: './docs/api.raml',
        routes: routes
    });

    server.start();
    return server;
}

```
#### 2. set
Set cache with a key and a JSON object. Use third parameter `expiryIn` to set expiry time - Availble time indicators are 'd' for days, 'h' for hours, and 'm' for minutes.
(eg. 3d, 2h, 30m)
If `expiryIn` is not provided, no expiry time will be set.

```js
import { responseHelper, cacheHelper } from '@builtlabs/api-helper';
import db from '../models';
import constants from '../helpers/constants';

const { Activity } = db.models;
const { cacheKeys, classificationStatuses, classificationStatusesAll } = constants;

function getAllActivities() {
    const cacheKey = cacheKeys.primaryActivityAll;
    return cacheHelper.get(cacheKey)
        .then(cacheResult => {
            if (cacheResult) {
                return Promise.resolve(cacheResult);
            }

            return Activity.findAll()
                .then(result => {
                    cacheHelper.set(cacheKey, result, '6h');    //Expired in 6h
                    return Promise.resolve(result);
                });
        });
}

```
#### 3. get
Get a cached object by key.

```js
import { responseHelper, cacheHelper } from '@builtlabs/api-helper';
import db from '../models';
import constants from '../helpers/constants';

const { Activity } = db.models;
const { cacheKeys, classificationStatuses, classificationStatusesAll } = constants;

function getAllActivities() {
    const cacheKey = cacheKeys.primaryActivityAll;
    return cacheHelper.get(cacheKey)
        .then(cacheResult => {
            if (cacheResult) {
                return Promise.resolve(cacheResult);
            }

            return Activity.findAll()
                .then(result => {
                    cacheHelper.set(cacheKey, result, '6h');    //Expired in 6h
                    return Promise.resolve(result);
                });
        });
}

```

[back to top](#table-of-contents)

---

## responseHelper

It helps to create a JSON response object for any API requests.

### Usages

#### 1. createError
Creates single error object with a error code, error message, and error field. 
Note that it returns a string to be used as the message parameter in an error class.

```js
import { responseHelper } from '@builtlabs/api-helper';

function validateEmail(email) {
    if (!email) {
        throw new SyntaxError(responseHelper.createError(responseHelper.errorCodes.field_validation_error, 'Email is required', 'email'));
    }
}

```

#### 2. createErrors
Creates an error list. 
Note that it returns a string to be used as the message parameter in an error class.

```js
import { responseHelper } from '@builtlabs/api-helper';

function validateEmail(email) {
    const errors = [
        { 
            errorCode: responseHelper.errorCodes.field_validation_error,
            errorMessage: 'Email is required',
            errorField: 'email'
        },
        { 
            errorCode: responseHelper.errorCodes.unique_key_error,
            errorMessage: 'Email is already registered',
            errorField: 'email'
        }
    ]
    
    throw new SyntaxError(responseHelper.createErrors(errors));
}

```

#### 3. createData
Creates response data object that has no error. 
Note that it returns a JSON object.

```js
import { responseHelper } from '@builtlabs/api-helper';

function getData() {
    const testData = {
        id: 1,
        name: 'John',
        company: 'BuiltLabs'
    };
    
    return responseHelper.createData(testData);
}

```

[back to top](#table-of-contents)

---

## requestHelper

Comming soon.

[back to top](#table-of-contents)

---
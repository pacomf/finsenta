# finsenta
First 'data-k-now' Product

Scaffolding Template: https://github.com/DaftMonk/generator-angular-fullstack.

## Usage

```
bower install
npm install
grunt serve
```

## Bluemix Deploy

### Changes Files

To deploy in Bluemix, you must change:

- In server/app.js
```
var cfenv = require('cfenv');
var appEnv = cfenv.getAppEnv();
// Start server
server.listen(appEnv.port, appEnv.bind, function () {
  console.log("server starting on " + appEnv.url);
});
```

- In server/config/enviroment/development.js
```
mongo: {
    uri: 'mongodb://0385857c-e01a-4c75-9b6a-3b4d7f5f077a:c51e2c0d-7040-4a32-839f-4379f940a60a@23.246.199.70:10010/db/finsenta'
  }
```

- In server/config/enviroment/production.js
```
mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://0385857c-e01a-4c75-9b6a-3b4d7f5f077a:c51e2c0d-7040-4a32-839f-4379f940a60a@23.246.199.70:10010/db/finsenta'
  }
```

## Execute in console

With the CF Command Line Interface installed [Download](https://github.com/cloudfoundry/cli/releases)

In Finsenta Folder, you execute:

1. Connect to Bluemix
```
cf api https://api.ng.bluemix.net
```

2. Login in Finsenta WorkSpace
```
cf login -u info@data-k-now.com -o info@data-k-now.com -s finsenta
```

3. Push and Deploy The Code
```
cf push finsenta
```





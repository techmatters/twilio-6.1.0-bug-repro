## Description

This repo contains code that reproduces a bug introduced in [Twilio node SDK](https://github.com/twilio/twilio-node) version 6.1.0, and seems to be present in newer versions as well.

The bug summary is that an operation that returns an `Instance`, like `DocumentInstance`

```
client.sync.v1.services.documents.create
```

returns an object with an invalid sid property, causing runtime errors when trying to use said object's methods.

### Repro steps

1. Add a `.env` file in v6.x.x with the following content

```
TWILIO_ACCOUNT_SID=" twilio account sid "
TWILIO_AUTH_TOKEN=" twilio auth token "
TWILIO_SYNC_SERVICE_SID=" twilio sync service sid "
```

1. Run `npm ci`
2. Run `npm run main`

What to expect

- If the code is executed from `/6.0.2`, the code succeeds.
- If the code is executed from `/6.1.0`, `/6.1.1` or `/6.2.0`, you get an error like

  ```
  twilio-6.1.0-repro/6.2.0/node_modules/twilio/lib/rest/sync/v1/service/document.js:34
              throw new Error("Parameter 'sid' is not valid.");
  ```

  which seems to be the error thrown [here](https://github.com/twilio/twilio-node/blob/909be26f520fdccb016bf2c90d04406e74fd4a01/src/rest/sync/v1/service/document.ts#L211).
  Note that there are 2 update statements, one that succeeds

  ```
  client.sync.v1
    .services(process.env.TWILIO_SYNC_SERVICE_SID)
    .documents(uniqueName)
    .update
  ```

  and another using

  ```
  syncdoc.update
  ```

  which fails.

Same behaviour is observed for reservations, tasks and other services' returned `Instance` objects, e.g.

```
client.taskrouter.v1.workspaces("").tasks("").reservations

```

### Note

This is just a guess, but looking at the changes between [6.0.2 and 6.1.0](https://github.com/twilio/twilio-node/compare/6.0.2...6.1.0#diff-743409d0252d905b7b1c2c5c3d4eb46973b2aae9f16f7282ef7406d75388227cR506), seems like this change from `src/rest/sync/v1/service/document.ts`, line 506

```diff
-    this._solution = { serviceSid, sid: sid || this.sid };
+    this._solution = { serviceSid, sid: sid };
```

could be the reason why the created instance is missing the sid (which before defaulted to `this.sid` and is now undefined)?

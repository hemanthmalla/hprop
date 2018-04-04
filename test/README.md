# Test hprop

Start app1 and app2
```bash
$ node app1.js
$ node app2.js
```

Once app1 and app2 are up and running, test with the following curl command.

```bash
$ curl -XPOST localhost:3000/test -H 'hprop-payment: v5' -H 'web-fe: v6'
```

Notice the hprop-payment header in app2's stdout.

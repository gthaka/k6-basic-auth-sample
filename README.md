### Basic **k6** script for testing an API endpoint with basic auth.

### Preliminaries
Make sure you have **k6**. [Instructions can be found here!](https://grafana.com/docs/k6/latest/set-up/install-k6/).

### Basic execution from terminal

Run the following command on the terminal. Change them based on your configuration.

```bash
k6 run --console-output=stdout.log \
    -e USERNAME=somename \
    -e PASSWORD=somepass \
    -e URL=http://api.example.com \
    -e EXPECTED_KEYS=key1,key2,key3 \
    -e RQ_DURATION='avg<300','p(95)<600' \
    script.js
```

***assuming the api response would be a json like***
```json
{"key1": "value1", "key2": "value2", "key3": 1234}
```
or 
```json
{"data": {"key1": "value1", "key2": "value2", "key3": 1234}, "status": "ok"}
```
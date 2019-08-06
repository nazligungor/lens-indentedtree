# cookie-jeep

A super simple cookie writing, reading, and deleting utility package.

Can be used straight in browser or as a part of node project.

Based onto [this](http://www.quirksmode.org/js/cookies.html).

## Usage

In a WebPack/Browserify node project:

```
$ npm install --save cookie-jeep
```

```
var cookies = require('cookie-jeep');

// Do stuff with them
cookies.write('testing_cookie', 'hello_world', 30);
var myCookie = cookies.read('testing_cookie');
cookies.delete('testing_cookie');
```

Straight in browser:

```
<script src="cookie-jeep.js"></scrip>

<script>
// Use it
cookies.write('testing_cookie', 'hello_world', 30);
...
</script>
```

## API

### write

```
write(name, value [,lifetime])
```

Lifetime is in days.

### read

```
read(name)
```

### delete

```
delete(name)
```

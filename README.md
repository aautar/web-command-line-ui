# web-command-line-ui

Frontend component to create a basic command line interface

## Creating an interface
To create a new interface, use the `Shell` constructor, e.g.

```javascript
const console = new Shell(
    document.getElementById("console"), // parent DOM element
    `>>`                                // prompt
);
```

## Programatically writing a line
Use the Shell.writeLine method to write a line, e.g.

```javascript
console.writeLine(`◕_◕ A simple CLI example`);
```

## Adding commands
Command are expected to be [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) with 2 methods:

- `match(_line)` which is responsible for parsing `_line` (the line being processed) and returns `true` if the line contains a command that matches that of the command object, `false` otherwise
- `process(_line)` which is responsible for taking `_line`, processing the command that is present, and returning a `String` with a result to be printed to the interface

Command objects are added to an instance of `Shell` via the `addCommand` method. For example, the following shows how to add a simple "echo" command, which will simply print out what is passed in:

```javascript
// Create the the command object
const commandEcho = Object.create({});

// match method to see if we have an "echo" command on the line
commandEcho.match = function(_input) {
    if(_input.startsWith('echo ')) {
        return true;
    }

    return false;
};

// process method to strip away the "echo " prefix and return everything else on the line
commandEcho.process = function(_inputData) { 
    return [_inputData.substring(5)];
};

// Add the command to the console
console.addCommand(commandEcho);
```

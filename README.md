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

## Defining commands
Command are expected to be [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). To interface with the Shell, 2 methods must be defined on the object: `match()` and `process()`.

### match
```
match(_line: String): Boolean
```

`match()` is responsible for parsing the line entered by the user and determining if it is a command that can be process by the command object.

#### Arguments

- `_line`: the line entered by the user

#### Return values

Return `true`, if the line contains a command that that can be processed by the command object, `false` otherwise.


### process
```
process(_line: String, _commandIntermediateIOInterface: Object): Promise
```

`process()` is called when the command is invoked by the shell.

#### Arguments

- `_line`: the line entered by the user
- `_commandIntermediateIOInterface`: an object containing methods to read or write from the shell while processing the given command. Shell methods should not be invoked directly while a command is being processed.


## Adding commands to a Shell

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

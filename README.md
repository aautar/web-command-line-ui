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

### match()
```
match(_line: String): Boolean
```

`match()` is responsible for parsing the line entered by the user and determining if it is a command that can be process by the command object.

#### Arguments

- `_line`: the line entered by the user

#### Return values

Return `true`, if the line contains a command that that can be processed by the command object, `false` otherwise.


### process()
```
process(_line: String, _commandIntermediateIOInterface: Object): Promise
```

`process()` is called when the command is invoked by the shell.

#### Arguments

- `_line`: the line entered by the user
- `_commandIntermediateIOInterface`: an object containing methods to read or write from the shell while processing the given command. Shell methods should not be invoked directly while a command is being processed.

#### Return values

Return a `Promise`. 
Both a resolved and rejected `Promise` is expected to return an array of strings, where each string is a line of output written to the shell.

## Adding commands to a Shell

Command objects are added to an instance of `Shell` via the `addCommand` method. 

The following shows how to add a simple "echo" command, which will simply print out what is passed in:

```javascript
const commandEcho = {
    /**
     * Method to see if we have an "echo" command on the line
     * 
     * @param {String} _line 
     * @returns {Boolean}
     */
    match: function(_line) {
        if(_line.startsWith('/echo')) {
            return true;
        }

        return false;
    },

    /**
     * Method to strip away the "echo " prefix and return everything else on the line
     * 
     * @param {String} _line 
     * @returns {Promise}
     */
    process: function(_line) {
        return new Promise((_resolve, _reject) => {
            _resolve([_line.substring(5)]);
        });
    }
};

// Add the command to the console
console.addCommand(commandEcho);
```

## Requesting user input

Commands can request and process input from the user within the command's `process()` method.
The `_commandIntermediateIOInterface` argument provides an object with the `requestInput()` method, which may be called multiple times to request data from the user.


### requestInput()
```
requestInput(_prompt: String, _isSecret: Boolean): Promise
```

`requestInput()` called to request user input.

#### Arguments

- `_prompt`: prompt indicating what is being requested from the user
- `_isSecret`: flag indicating if the value entered is a secret or not; secrets are not displayed in the Shell

#### Return values

Return a `Promise`. 
A resolved `Promise` will return a string with the value entered by the user

### Example
The following demonstrate the `process()` method for a "wait" command, which will:

- As the user to enter a certain number of seconds
- Print "tick" for every second that goes by
- Resolve such that "finished." is displayed to the user when the given number of seconds has elapsed

```javascript
process: function(_inputData, _intermediateIOInterface) { 
    return new Promise(async (_resolve, _reject) => {
        const numSecStr = await _intermediateIOInterface.requestInput("Enter number of seconds:", false);
        const numSec = Number.parseInt(numSecStr);

        if(!Number.isInteger(numSec)) {
            return _reject(["invalid input for command."]);
        }

        const intv = setInterval(() => {
            _intermediateIOInterface.writeLine("tick..");
        }, 1000);

        setTimeout(() => {
            clearInterval(intv);
            _resolve(["finished."]);
        }, numSec * 1000);
    });
}
```

import {DOMHelper} from './DOMHelper.mjs'

function Shell(_shellContainer, _promptMarkup) {
    const self = this;

    const KEY_UP_ARROW = 38;
    const KEY_DOWN_ARROW = 40;

    const commands = [];
    const commandBuffer = [];
    let commandBufferLookbackIndex = 0;
    let currentCommandEntry = '';

    const renderInitial = function() {
        var markup = `
            <div>
                <div id="output" style="cursor:default;"></div>
            
                <div id="input">
                    <form class="cmdline" onsubmit="return false;">
                        <table class="inputtable" border="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td id="inputprompt">prompt:#&nbsp;</td>
                                    <td style="width:100%;"><input id="inputcmd" autocomplete="off" type="text" /></td>
                                </tr>
                            </tbody>
                        </table>
                
                    </form>
                </div>
                
                <div id="input-password" style="display:none;">
                    <form class="cmdline" onsubmit="return false;">
                        <table class="inputtable" border="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td id="inputpassprompt">password:#&nbsp;</td>
                                    <td style="width:100%;"><input id="inputpass" autocomplete="off" type="password" /></td>
                                </tr>
                            </tbody>
                        </table>
                
                    </form>
                </div>
            </div>`;

        return DOMHelper.appendHTML(_shellContainer, markup);
    };

    const shellElement = renderInitial();
    const _promptContainer = shellElement.querySelector('#input');
    const _inputForm = _promptContainer.querySelector('form.cmdline');
    const _promptElement = _promptContainer.querySelector('#inputprompt');
    const _inputContainer = _promptContainer.querySelector('#inputcmd');
    const _outputContainer = shellElement.querySelector('#output');

    const putFocusOnInput = function() {
        _inputContainer.focus();
    };

    const fetchInputLine = function() {
        return _inputContainer.value;
    };

    const overwriteInputLine = function(_cmd) {
        _inputContainer.value = _cmd;
    };

    const clearInputLine = function() {
        _inputContainer.value = '';
    };

    const hidePrompt = function() {
        _promptContainer.style.display = 'none';
    };

    const showPrompt = function() {
        _promptContainer.style.display = 'block';
    };

    const processCommandInput = function() {
        const ln = fetchInputLine();
        if (ln.length <= 0)
            return;

        commandBuffer.push(ln);
        commandBufferLookbackIndex = 0; // reset
        currentCommandEntry = '';

        self.writeLine(`<p class="prev-input">${_promptMarkup}${ln}</p>`);

        clearInputLine();
        hidePrompt();

        let foundMatch = false;
        commands.forEach((_command) => {
            if(!_command.match(ln)) {
                return false;
            }

            const output = _command.process(ln);
            output.forEach((_outputLine) => {
                self.writeLine(_outputLine);
            });

            foundMatch = true;
        });

        if(!foundMatch) {
            self.writeLine(`¯\_(ツ)_/¯ Unrecognized input`);
        }

        showPrompt();
        window.scrollTo(0, document.body.scrollHeight);
        putFocusOnInput();
    };

    const bindKeys = function () {
        _inputContainer.addEventListener('keyup', function (e) {
            if (e.keyCode == KEY_UP_ARROW) {
                commandBufferLookbackIndex++;
                if (commandBufferLookbackIndex > commandBuffer.length) {
                    commandBufferLookbackIndex = commandBuffer.length;
                }

                overwriteInputLine(commandBuffer[commandBuffer.length - commandBufferLookbackIndex]);
                e.preventDefault();
            }
            else if (e.keyCode == KEY_DOWN_ARROW) {
                commandBufferLookbackIndex--;
                if (commandBufferLookbackIndex <= 0) {
                    commandBufferLookbackIndex = 0;
                    overwriteInputLine(currentCommandEntry);
                } else {
                    overwriteInputLine(commandBuffer[commandBuffer.length - commandBufferLookbackIndex]);
                }
                e.preventDefault();
            }
            else {
                currentCommandEntry = fetchInputLine();
            }
        });

        _inputForm.addEventListener('submit', function () {
            processCommandInput();
        });

        window.addEventListener('click', function(event) {
            // If we haven't selected anything, put focus back on the input prompt
            if(window.getSelection().toString().length <= 0) {
                putFocusOnInput();
            }
        });

        DOMHelper.replaceHTML(_promptElement, _promptMarkup);
        putFocusOnInput();
    };

    /**
     * 
     * @param {String} _txt 
     */
    this.writeLine = function(_txt) {
        DOMHelper.appendHTML(_outputContainer, `<p class="output-message">${_txt}</p>`);
    };

    this.addCommand = function(_command) {
        commands.push(_command);
    };

    bindKeys();
};

export { Shell }

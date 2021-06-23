import {DOMHelper} from './DOMHelper.mjs'

function Shell(_shellContainer, _promptMarkup) {
    const self = this;

    const componentId = `c-8aad94b3-d0ab-42f1-ba32-2970ef9b7df2`;

    // need to generate dynamically
    const instanceId = `i-fbe38596-2910-4448-bc2a-9b4af7a56891`;

    const KEY_UP_ARROW = 38;
    const KEY_DOWN_ARROW = 40;

    const commands = [];
    const commandBuffer = [];
    let commandBufferLookbackIndex = 0;
    let currentCommandEntry = '';

    const renderComponentStyles = function() {
        const styles = `
            .${componentId}-output { cursor:default; }
        `.trim();

        DOMHelper.appendHTML(document.head, `<style style="text/css">${styles}</style>`);
    };

    const renderComponentElements = function() {
        var markup = `
            <div>
                <div class="${componentId}-output"></div>
                <div class="${componentId}-input">
                    <form class="${componentId}-cmdline" onsubmit="return false;">
                        <table class="inputtable" border="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td class="${componentId}-inputprompt">prompt:#&nbsp;</td>
                                    <td style="width:100%;"><input class="${componentId}-inputcmd" autocomplete="off" type="text" /></td>
                                </tr>
                            </tbody>
                        </table>
                
                    </form>
                </div>
                
                <div class="${componentId}-input-password" style="display:none;">
                    <form class="${componentId}-cmdline-password" onsubmit="return false;">
                        <table class="inputtable" border="0" cellspacing="0">
                            <tbody>
                                <tr>
                                    <td class="${componentId}-inputpassprompt">password:#&nbsp;</td>
                                    <td style="width:100%;"><input class="${componentId}-inputpass" autocomplete="off" type="password" /></td>
                                </tr>
                            </tbody>
                        </table>
                
                    </form>
                </div>
            </div>`;

        return DOMHelper.appendHTML(_shellContainer, markup);
    };

    renderComponentStyles();
    const shellElement = renderComponentElements();

    const _promptContainer = shellElement.querySelector(`.${componentId}-input`);
    const _inputForm = _promptContainer.querySelector(`.${componentId}-cmdline`);
    const _promptElement = _promptContainer.querySelector(`.${componentId}-inputprompt`);
    const _inputContainer = _promptContainer.querySelector(`.${componentId}-inputcmd`);
    const _outputContainer = shellElement.querySelector(`.${componentId}-output`);

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

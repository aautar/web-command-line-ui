import {DOMHelper} from './DOMHelper.mjs'

const componentId = `c-web-command-line-ui-shell-8aad94b3-d0ab-42f1-ba32-2970ef9b7df2`;

// From https://stackoverflow.com/a/2117523
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

/**
 * 
 * @param {Element} _shellContainer 
 * @param {String} _promptString 
 */
function Shell(_shellContainer, _promptString) {
    const self = this;
    const instanceId = `i-web-command-line-ui-shell-${uuidv4()}`;

    const KEY_UP_ARROW = 38;
    const KEY_DOWN_ARROW = 40;

    const promptMarkup = `<span class='promptcolor'>${DOMHelper.escapeHtml(_promptString)}</span>&nbsp;`;
    const commands = [];
    const commandBuffer = [];
    let commandBufferLookbackIndex = 0;
    let currentCommandEntry = '';

    let promptTextColor = '#878787';
    let outputTextColor = '#000';
    let outputBlockHoverBackgroundColor = '#353535';
    let outputTextWrapStyle = '';

    const outputBlockClass = 'output-block';

    const renderComponentStyles = function() {
        const existingStyleElem = document.querySelector(`style#${componentId}`);
        if(existingStyleElem !== null) {
            document.head.removeChild(existingStyleElem);
        }

        const styles = `
            .${componentId}-output { cursor:default; padding:5px 5px 0px 0px; }
            .${componentId} .hide { display:none; }
            .${componentId} .line { padding:2px 0; margin:0; }
            .${componentId} input { background-color:transparent; color:${promptTextColor}; margin:0; border:0 none; width:100%; outline:none; }
            .${componentId} .inputtable { margin-bottom: 15px; }
            .${componentId} .promptcolor { color:${promptTextColor}; }
            .${componentId} .prev-input { color:${promptTextColor}; }
            .${componentId} .${outputBlockClass} { color:${outputTextColor}; }
            .${componentId} .${outputBlockClass} .summary { ${outputTextWrapStyle} }
            .${componentId} .output-block-expandable { }
            .${componentId} .output-block-expandable:hover { background-color:${outputBlockHoverBackgroundColor}; }
            .${componentId} .block-expanded-content { border-left:2px solid #6c6c6c; padding:0px 6px 0 6px; margin:4px 0 0 0; }

            /* overrides / additions to default styles */
            ${overrideStyles}

        `.trim();

        DOMHelper.appendHTML(document.head, `<style id="${componentId}" style="text/css">${styles}</style>`);
    };

    const renderComponentElements = function() {
        var markup = `
            <div class="${componentId} ${instanceId}">
                <div class="${componentId}-output"></div>
                <div class="${componentId}-input line">
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

    const shellElement = renderComponentElements();

    const _promptContainer = shellElement.querySelector(`.${componentId}-input`);
    const _inputForm = _promptContainer.querySelector(`.${componentId}-cmdline`);
    const _promptElement = _promptContainer.querySelector(`.${componentId}-inputprompt`);
    const _inputContainer = _promptContainer.querySelector(`.${componentId}-inputcmd`);
    const _outputContainer = shellElement.querySelector(`.${componentId}-output`);


    let maxOutputBlocks = 50;
    let hasPausedAutoscroll = false;
    let overrideStyles = "";

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

        DOMHelper.appendHTML(_outputContainer, `<p class="prev-input line">${promptMarkup}${ln}</p>`);

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

        window.addEventListener('click', function(e) {
            const parentBlockEl = e.target.closest(`.${outputBlockClass}`);
            if(parentBlockEl) {
                return;
            }

            // If we haven't selected anything, put focus back on the input prompt
            if(window.getSelection().toString().length <= 0) {
                putFocusOnInput();
            }
        });

        DOMHelper.replaceHTML(_promptElement, promptMarkup);
        putFocusOnInput();
    };

    const bindScrollHandler = function() {
        document.addEventListener("scroll", (e) => {
            const maxScrollY = _outputContainer.offsetHeight - window.innerHeight;

            //console.log(`window.scrollY = ${window.scrollY}`);
            //console.log(`maxScrollY = ${maxScrollY}`);

            if(window.scrollY < maxScrollY) {
                hasPausedAutoscroll = true;
            } else {
                hasPausedAutoscroll = false;
            }
        });
    };

    const scrollToLastOutput = function() {
        shellElement.scrollIntoView({ behavior: "instant", block: "end", inline: "nearest" });
    };

    const limitToMaxLines = function() {
        const numOutputMessages = _outputContainer.querySelectorAll(`.${outputBlockClass}`).length;
        if(numOutputMessages > maxOutputBlocks) {
            _outputContainer.querySelector(`.${outputBlockClass}:first-of-type`).remove();
        }
    };

    /**
     * 
     * @returns {String}
     */
    this.getComponentId = function() {
        return componentId;
    };

    /**
     * 
     * @param {String} _txt 
     */
    this.writeLine = function(_txt) {
        DOMHelper.appendHTML(_outputContainer, `<div class="${outputBlockClass} line">${_txt}</div>`);
        limitToMaxLines();

        if(!hasPausedAutoscroll) {
            scrollToLastOutput();
        }
    };

    /**
     * 
     * @param {String} _linePreviewTxt 
     * @param {*} _onExpansion 
     */
    this.writeBlock = function(_id, _linePreviewTxt, _onExpansion) {
        const blockContent = `
            <div class="${outputBlockClass} output-block-expandable line">
                <div class="summary">${_linePreviewTxt}</div>
                <div class="block-expanded-content hide">test</div>
            </div>
        `;

        const el = DOMHelper.appendHTML(_outputContainer, blockContent);
        el.addEventListener("click", function(e) {
            e.preventDefault();

            const parentBlockEl = e.target.closest(`.${outputBlockClass}`);
            const expandedContentEl = (parentBlockEl.getElementsByClassName('block-expanded-content'))[0];

            if(expandedContentEl.classList.contains('hide')) {
                expandedContentEl.innerHTML = _onExpansion(_id);
                expandedContentEl.classList.remove('hide');
            } else {
                expandedContentEl.classList.add('hide');
                expandedContentEl.innerHTML = '';
            }

        });

        limitToMaxLines();

        if(!hasPausedAutoscroll) {
            scrollToLastOutput();
        }
    };

    /**
     * 
     * @param {Object} _command 
     */
    this.addCommand = function(_command) {
        commands.push(_command);
    };

    /**
     * 
     * @param {Number} _max 
     */
    this.setMaxOutputBlocks = function(_max) {
        maxOutputBlocks = _max;
    };

    /**
     * 
     * @param {String} _color 
     */
    this.setPromptTextColor = function(_color) {
        promptTextColor = _color;
        renderComponentStyles();
    };

    /**
     * 
     * @param {String} _color 
     */
    this.setOutputTextColor = function(_color) {
        outputTextColor = _color;
        renderComponentStyles();
    };

    /**
     * 
     * @param {String} _backgroundColor 
     */
    this.setOutputBlockHoverBackgroundColor = function(_backgroundColor) {
        outputBlockHoverBackgroundColor = _backgroundColor;
        renderComponentStyles();
    };

    /**
     * 
     * @param {String} _cssStr 
     */
    this.setComponentStyleOverrides = function(_cssStr) {
        overrideStyles = _cssStr;
        renderComponentStyles();
    };

    /**
     * 
     * @param {Boolean} _wrapText 
     */
    this.setOutputTextWrap = function(_wrapText) {
        if(_wrapText) {
            outputTextWrapStyle = '';            
        } else {
            outputTextWrapStyle = `white-space: nowrap; text-overflow: ellipsis; overflow: hidden;`;
        }
        
        renderComponentStyles();
    };

    bindKeys();
    bindScrollHandler();
    renderComponentStyles();
};

// expose componentId
Shell.componentId = componentId;

export { Shell }

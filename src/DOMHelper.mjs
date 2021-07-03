const DOMHelper = {
    createElementsFromHtml: function(_elementHTML) {
        const wrapperElem = document.createElement('div');
        wrapperElem.innerHTML = _elementHTML.trim();
        return wrapperElem.childNodes;
    },
    
    appendHTML: function(_parentElement, _childElementHtml) {
        const elements = DOMHelper.createElementsFromHtml(_childElementHtml);        
        const firstChild = elements[0];
        
        while(elements.length > 0) {
            _parentElement.appendChild(elements[0]);
        }
        
        return firstChild;
    },

    replaceHTML: function(_parentElement, _childElementHtml) {
        _parentElement.innerHTML = "";
        DOMHelper.appendHTML(_parentElement, _childElementHtml);
    },

    escapeHtml: function(unsafe) {
        // from https://stackoverflow.com/a/6234804
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
     }
};

export { DOMHelper }

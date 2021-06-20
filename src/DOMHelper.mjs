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
};

export { DOMHelper }

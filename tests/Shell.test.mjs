import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const test = require('ava');

import {Shell} from '../src/Shell.mjs';

test('getComponentId returns correct component ID', t => {
    const expectedComponentId = `c-web-command-line-ui-shell-8aad94b3-d0ab-42f1-ba32-2970ef9b7df2`;
    const actualComponentId = Shell.componentId;    
	t.true(actualComponentId === expectedComponentId);
});


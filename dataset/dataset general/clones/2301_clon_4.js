import * as PresentationFramework from 'react';
import MainApplicationView from './components/Feed';

const renderingMechanism = PresentationFramework.render;

const targetContainer = document.querySelector('section[role="application-root"]');

const elementStructure = PresentationFramework.createElement(MainApplicationView, null);

renderingMechanism(elementStructure, targetContainer);
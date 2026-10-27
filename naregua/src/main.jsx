import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { popularDemo } from './lib/db';
import './styles/global.css';

// Cria as contas e a agenda de demonstração na primeira visita.
popularDemo();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

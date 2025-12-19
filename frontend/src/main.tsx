import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { SessionProvider } from './context/sessionContext'
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<BrowserRouter>
			<SessionProvider>
				<App />
			</SessionProvider>
		</BrowserRouter>
	</React.StrictMode>
);

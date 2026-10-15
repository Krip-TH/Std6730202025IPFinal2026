import { KripTop_createApp } from './app.js';
const KripTop_port = Number(process.env.PORT || 3000);
KripTop_createApp().listen(KripTop_port, '0.0.0.0', () => console.log(`KripTop HR API listening on port ${KripTop_port}`));

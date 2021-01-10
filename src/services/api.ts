import axios from 'axios';

const api = axios.create({
  baseURL: 'http://248a083f0967.ngrok.io/',
});

export default api;

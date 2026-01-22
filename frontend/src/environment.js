let is_prod = true;
const server = is_prod
  ? "https://connectus-backend-tzdc.onrender.com"
  : "http://localhost:8000";

export default server;

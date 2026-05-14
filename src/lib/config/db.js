// Legacy compat wrapper — delegates to the cached connection in /lib/db.ts
// Kept for any old require('config/db') paths that may exist.
const dbConnect = require('../db').default || require('../db');

module.exports = { dbConnection: dbConnect };

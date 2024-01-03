
const { Magic } = require('@magic-sdk/admin');

// Construct with an API key:
export const magicAdmin = await Magic.init(process.env.MAGIC_SERVER_KEY);

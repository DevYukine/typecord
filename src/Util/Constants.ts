export const DEFAULT_CLIENT_OPTIONS = {
	ws: {
		large_threshold: 250,
		compress: false,
		properties: {
			$os: process.platform,
			$browser: 'typecord',
			$device: 'typecord',
		},
		version: 7,
	},
	http: {
		version: 7,
		api: 'https://discordapp.com/api',
		cdn: 'https://cdn.discordapp.com',
		invite: 'https://discord.gg',
	}
};

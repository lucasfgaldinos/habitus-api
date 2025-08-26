import "dotenv/config";

interface Env {
	MONGO_URL: string;
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	PORT: number;
	JWT_SECRET: string;
}

function getEnvVar(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Env "${key}" not defined.`);
	}
	return value;
}

const env: Env = {
	GITHUB_CLIENT_ID: getEnvVar("GITHUB_CLIENT_ID"),
	GITHUB_CLIENT_SECRET: getEnvVar("GITHUB_CLIENT_SECRET"),
	PORT: Number(getEnvVar("PORT")),
	JWT_SECRET: getEnvVar("JWT_SECRET"),
	MONGO_URL: getEnvVar("MONGO_URL"),
};

export default env;

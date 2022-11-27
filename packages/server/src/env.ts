import { config as configDotEnv } from "dotenv";

const isProductionRuntime = process.env.NODE_ENV === "production";

if (!isProductionRuntime) {
    configDotEnv();
}

function getEnvVarOrThrow(name: string): string {
    const value = process.env[name];
    if (value === undefined) {
        throw new Error(`Environment variable ${name} is not set`);
    }
    return value;
}

function getEnvVarOrDefault(name: string, defaultValue: string): string {
    const value = process.env[name];
    return value === undefined ? defaultValue : value;
}

const ENV = {
    server: {
        port: parseInt(getEnvVarOrDefault("PORT", "4001")),
        host: getEnvVarOrDefault("HOST", "0.0.0.0"),
    },
};

export default ENV;

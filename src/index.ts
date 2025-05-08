import { CoreSystem } from "./kernel/CoreSystem";
import { CoreOptions } from "./kernel/CoreOptions";

async function parseArgs() {
    const args = process.argv.slice(2);
    const sourcePaths: string[] = [];
    const plugins: Record<string, boolean> = {};
    args.forEach((arg) => {
        if (arg.startsWith('-')) {
            const pluginArg = arg.substring(1);
            const [pluginName, pluginValue] = pluginArg.split('=');
            plugins[pluginName] = pluginValue.toLowerCase() === 'true';
        } else {
            sourcePaths.push(arg);
        }
    });
    console.log("Ingrese el año a analizar del repositorio:");
    const year = await new Promise<string>((resolve) => {
        process.stdin.once('data', (data) => {
            resolve(data.toString().trim());
            process.stdin.pause();
        });
    });

    return { srcPaths: sourcePaths, plugins, year };
}

async function main() {
    try {
        const options = await parseArgs();
        console.log("Opciones de entrada:", options);
        const coreSystem = new CoreSystem(options as CoreOptions);
        await coreSystem.initialize();
        await coreSystem.calcular();
        coreSystem.terminate();
    } catch (error) {
        console.error("Error en la ejecución del programa:", error);
        process.exit(1);
    }
}

main();
import { CoreOptions } from "./CoreOptions";
import { PluginOptions } from "../plugins/PluginOptions";
import { PluginManager } from "./PluginManager";
import * as fs from "fs";
import * as path from "path";

type PluginParams = Record<string, string | undefined>;

export class CoreSystem {
    private pluginManager: PluginManager;
    private options: CoreOptions;

    constructor(options: CoreOptions) {
        this.options = options;
        this.pluginManager = new PluginManager();
    }

    async initialize(): Promise<void> {
        console.log("Inicializando el sistema...");
        
        for (const [pluginName, isEnabled] of Object.entries(this.options.plugins)) {
            if (isEnabled) {
                console.log(`Cargando plugin: ${pluginName}`);
                const pluginRName = "Calc" + pluginName.toLocaleUpperCase();
                if (!pluginRName.includes("LTFC")) {
                    const params: PluginParams = {
                        srcRepoPath: this.options.srcPaths[0],
                        yearRepo: this.options.year,
                    };
                    await this.pluginManager.loadPlugin(pluginRName, params);
                } else {
                    const params: PluginParams = {
                        srcRepoPath: this.options.srcPaths[0],
                        srcOutputPath: this.options.srcPaths[1],
                        yearRepo: this.options.year,
                    };
                    await this.pluginManager.loadPlugin(pluginRName, params);
                }
            }
        }
    }

    async calcular(): Promise<void> {
        console.log("Calculando métricas...");
        
        for (const [pluginName, isEnabled] of Object.entries(this.options.plugins)) {
            if (isEnabled) {
                const pluginRName = "Calc" + pluginName.toLocaleUpperCase();
                console.log(`Ejecutando plugin: ${pluginRName}`);
                this.pluginManager.inicializePlugin(pluginRName);
                const result = await this.pluginManager.calcMetrics(pluginRName);
                console.log(`Resultado del plugin ${pluginRName}:`, result);
                this.pluginManager.terminatePlugin(pluginRName);
            }
        }
    }

    terminate(): void {
        console.log("Terminando el calculo...");
    }
}
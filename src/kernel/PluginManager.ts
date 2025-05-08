import { PluginOptions } from "../plugins/PluginOptions";

type PluginParams = Record<string, string | undefined>;

export class PluginManager {
    private plugins: Map<string, PluginOptions> = new Map();

    async loadPlugin(name: string, params: PluginParams): Promise<void> {
        try {
            const pluginModule = require(`../plugins/${name}`);
            const plugin = pluginModule.createPlugin(params);
            this.plugins.set(name, plugin);
        } catch (error) {
            console.error(`Error cargando el plugin ${name}:`, error);
        }
    }

    inicializePlugin(name: string): void {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.inicialize();
        } else {
            console.error(`Plugin ${name} no encontrado.`);
        }
    }

    async calcMetrics(name: string): Promise<any> {
        const plugin = this.plugins.get(name);
        if (plugin) {
            return await plugin.calcMetrics();
        } else {
            console.error(`Plugin ${name} no encontrado.`);
            return null;
        }
    }

    terminatePlugin(name: string): void {
        const plugin = this.plugins.get(name);
        if (plugin) {
            plugin.terminate();
            this.plugins.delete(name);
        } else {
            console.error(`Plugin ${name} no encontrado.`);
        }
    }
}
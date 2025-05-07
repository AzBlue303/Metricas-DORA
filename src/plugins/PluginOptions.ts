export interface PluginOptions {
    nameMetric: string;
    inicialize(): void;
    calcMetrics(...args: any[]): any;
    terminate(): void;
}
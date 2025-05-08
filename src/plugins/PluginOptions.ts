export interface PluginOptions {
    nameMetric: string;
    inicialize(): void;
    calcMetrics(): any;
    terminate(): void;
}
import { PluginOptions } from "./PluginOptions";

import { console } from "inspector";

import simpleGit from "simple-git";

export class CalcDF implements PluginOptions {
    nameMetric: string = "CalcDF";
    repoPath: string;
    yearRepo: string;

    resultDF: number;

    constructor(srcRepoPath: string, yearRepo: string) {
        this.repoPath = srcRepoPath;
        this.yearRepo = yearRepo;
        this.resultDF = 0;
    }

    inicialize(): void {
        console.log("Calculando Deployment Frequency...");
    }

    async calcMetrics(): Promise<any> {
        try {
            const git = simpleGit(this.repoPath);
            const tags = (await git.tags()).all;

            const tagsPorFecha = await Promise.all(
                tags.map(async tag => {
                    const log = await git.raw(["log", "-1", "--format=%ai", tag]);
                    // retorno el tag si la fecha es del año 2023
                    const fecha = log.split(" ")[0].split("-")[0];
                    if (fecha === this.yearRepo) {
                        return tag;
                    }
                })).then(tags => tags.filter(tag => tag !== undefined));
            const tagsFiltrados = await Promise.all(
                tagsPorFecha.map(async tag => {
                    if (!/rc|beta|alpha/.test(tag)) {
                        return tag;
                    }
                })
            ).then(tags => tags.filter(tag => tag !== undefined));

            // Filtrar valores nulos y retornar los tags estables del año
            this.resultDF = tagsFiltrados.length;
        } catch (error) {
            console.error("Error calculating Deployment Frequency: ", error);
            this.resultDF = 0;
        } finally {
            console.log("Deployment Frequency calculation finished.");
        }
        return this.resultDF;
    }

    terminate(): void {
        console.log("Calculo terminado, resultado: ", this.resultDF);
    }
}

export function createPlugin(params: {srcRepoPath: string, yearRepo: string}): PluginOptions {
    return new CalcDF(params.srcRepoPath, params.yearRepo);
}
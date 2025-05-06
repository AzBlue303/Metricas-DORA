import { PluginOptions } from "./PluginOptions";

import { console } from "inspector";

import simpleGit from "simple-git";

export class CalcCFR implements PluginOptions {
    nameMetric: string = "CalcCFR";
    repoPath: string;
    yearRepo: string;

    resultCFR: number;

    constructor(srcRepoPath: string, yearRepo: string) {
        this.repoPath = srcRepoPath;
        this.yearRepo = yearRepo;
        this.resultCFR = 0;
    }

    inicialize(): void {
        console.log("Calculando Change Failure Rate...");
    }

    async calcMetrics(...args: any[]): Promise<any> {
        let versionesEstables = [];
        let versionesFallidas = [];

        try {
            const git = simpleGit(this.repoPath);
            const tags = (await git.tags()).all;

            const tagsPorFecha = await Promise.all(
                tags.map(async tag => {
                    const log = await git.raw(["log", "-1", "--format=%ai", tag]);
                    // retorno el tag si la fecha es del año 2023
                    const fecha = log.split(" ")[0].split("-")[0];
                    if (fecha === this.yearRepo) {
                        return {tag: tag};
                    }
                })).then(tags => tags.filter(tag => tag !== undefined));

                const tagsEstables = await Promise.all(
                    tagsPorFecha.map(async tag => {
                        if (!/rc|beta|alpha/.test(tag.tag)) {
                            return tag;
                        }
                    }
                )).then(tags => tags.filter(tag => tag !== undefined));
                const tagsFallidos = await Promise.all(
                    tagsPorFecha.map(async tag => {
                        if (tag.tag.includes("rc")) {
                            return tag;
                        }
                    }
                )).then(tags => tags.filter(tag => tag !== undefined));
            versionesEstables = tagsEstables;
            versionesFallidas = tagsFallidos;
            this.resultCFR = (versionesFallidas.length / (versionesEstables.length + versionesFallidas.length)) * 100;
            this.resultCFR = Math.round(this.resultCFR * 100) / 100; // Redondear a dos decimales
            console.log("Tags estables: ", versionesEstables, " Tags fallidos: ", versionesFallidas, " CFR: ", this.resultCFR);
        }
        catch (error) {
            console.error("Error calculando Change Failure Rate: ", error);
            this.resultCFR = 0;
        }
        finally {
            console.log("Change Failure Rate calculation finished");
        }
        return this.resultCFR;
    }

    terminate(): void {
        console.log("Calculo terminado, resultado: ", this.resultCFR);
    }

}

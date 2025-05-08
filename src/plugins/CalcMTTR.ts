import { PluginOptions } from "./PluginOptions";

import { console } from "inspector";

import simpleGit from "simple-git";

export class CalcMTTR implements PluginOptions {
    nameMetric: string = "CalcMTTR";
    repoPath: string;
    yearRepo: string;

    resultMTTR: number;

    constructor(srcRepoPath: string, yearRepo: string) {
        this.repoPath = srcRepoPath;
        this.yearRepo = yearRepo;
        this.resultMTTR = 0;
    }

    inicialize(): void {
        console.log("Calculando Mean Time To Recovery...");
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
                        return { tag: tag, fecha: log.split(" ")[0] };
                    }
                })).then(tags => tags.filter(tag => tag !== undefined));
            const dias = tagsPorFecha.map((tag, index, arr) => {
                if ((tag.tag).includes("-rc")) {
                    const diferenciaDias = Math.abs(new Date(tag.fecha).getTime() - new Date(this.findPreviousNonRC(arr, index).fecha).getTime()) / (1000 * 3600 * 24);
                    return diferenciaDias;
                }
            }).filter(dia => dia !== undefined);
            const sumaDias = dias.reduce((acc, dia) => acc + dia, 0);
            const promedioDias = sumaDias / dias.length;
            this.resultMTTR = Math.round(promedioDias * 100) / 100;
            return this.resultMTTR;
        }
        catch (error) {
            console.error("Error calculating Mean Time To Recovery: ", error);
            this.resultMTTR = 0;
        } finally {
            console.log("Mean Time To Recovery caclulation finished");
        }
    }
    findPreviousNonRC(arr: { tag: string; fecha: string; }[], index: number): any | undefined {
        for (let i = index - 1; i >= 0; i--) {
            if (!arr[i].tag.includes("-rc")) {
                return arr[i];
            }
        }
        return undefined;
    }

    terminate(): void {
        console.log("Calculo terminado, resultado: " + this.resultMTTR);
    }
}

export function createPlugin(params: {srcRepoPath: string, yearRepo: string}): PluginOptions {
    return new CalcMTTR(params.srcRepoPath, params.yearRepo);
}
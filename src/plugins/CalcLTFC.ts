import { PluginOptions } from "./PluginOptions";
import { GraphGenerator } from "../kernel/GraphGenerator";

import { console } from "inspector";

import simpleGit from "simple-git";

export class CalcLTFC implements PluginOptions {
    nameMetric: string = "CalcLTFC";
    repoPath: string;
    yearRepo: string;

    resultLTFC: number;

    dataGraph: { dias: number[]; commit: string[] } = { dias: [], commit: [] };
    outputPath: string;

    constructor(srcRepoPath: string, srcOutpoutPath: string, yearRepo: string) {
        this.repoPath = srcRepoPath;
        this.yearRepo = yearRepo;
        this.outputPath = srcOutpoutPath;
        this.resultLTFC = 0;
    }

    inicialize(): void {
        console.log("Calculando Lead Time for Changes...");
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

            const dataGraph: { dias: number[]; commit: string[] } = { dias: [], commit: [] };

            const dataTags = await Promise.all(
                tagsFiltrados.map(async tag => {
                    const log = await git.raw(["log", "-1", "--format=%ai", tag]);

                    const sha = await git.raw(["rev-list", "-n", "1", tag]);

                    const prevSha = await git.raw(["rev-list", "-n", "1", `${tag}^1`]);

                    const commitPrevius = await git.raw(["log", "-1", "--format=%ai", prevSha.trim()]);

                    const fecha1 = new Date(log.trim());
                    const fecha2 = new Date(commitPrevius.trim());

                    const diferencia = Math.abs(fecha1.getTime() - fecha2.getTime());

                    console.log(`Version: ${tag}, Fecha Version: ${fecha1}, Fecha Commit: ${fecha2}, Diferencia: ${Math.floor(diferencia / (1000 * 60 * 60 * 24))} días`);
                    return { tag: tag, fecha: log, commit: commitPrevius, sha: sha, diferencia: Math.floor(diferencia / (1000 * 60 * 60 * 24)) };
                }));

            console.log(dataGraph);
            dataTags.forEach(tag => {
                if (tag) {
                    dataGraph.dias.push(tag.diferencia);
                    dataGraph.commit.push(tag.sha.substring(0, 7));
                    console.log(tag.diferencia, tag.sha.substring(0, 7));
                }
            });
            const graphGenerator = new GraphGenerator(dataGraph, "C:/Users/ignac/OneDrive/Escritorio/(S)UFRO/2025/Semestre 1/Arqui/TareaMDORA/metricas-dora/CalculoLTFC.png");
            graphGenerator.exportToPNG();

            this.resultLTFC = Math.round(dataGraph.dias.reduce((a, b) => a + b, 0) / dataGraph.dias.length * 100) / 100;
        } catch (error) {
            console.error("Error calculando Life Time for Changes: ", error);
            this.resultLTFC = 0;
        } finally {
            console.log("Life Time for Changes calculo terminado, resultado. " + this.resultLTFC + " días.");
        }
        return this.resultLTFC;
    }

    terminate(): void {
        console.log("Calculo terminado, resultado: ", this.resultLTFC);
    }
}

export function createPlugin(params: {srcRepoPath: string, srcOutputPath: string, yearRepo: string}): PluginOptions {
    return new CalcLTFC(params.srcRepoPath, params.srcOutputPath, params.yearRepo);
}
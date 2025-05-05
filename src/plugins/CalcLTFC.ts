import { PluginOptions } from "./PluginOptions";
import { GraphGenerator } from "../kernel/GraphGenerator";

import { console } from "inspector";

import dotenv from 'dotenv';
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export class CalcLTFC implements PluginOptions {
    nameMetric: string = "CalcLTFC";
    repoPath: string;
    yearRepo: string;

    resultLTFC: number;

    dataGraph: { dias: number[]; commit: string[] } = { dias: [], commit: [] };
    outputPath: string;
    owner: string = "";
    repo: string = "";

    constructor(srcRepoPath: string, srcOutpoutPath: string, yearRepo: string) {
        this.repoPath = srcRepoPath;
        this.yearRepo = yearRepo;
        this.outputPath = srcOutpoutPath;
        this.resultLTFC = 0;
    }

    inicialize(): void {
        console.log("Calculando Lead Time for Changes...");
    }

    async calcMetrics(...args: any[]): Promise<any> {
        try {
            // Extraer el owner y repo de la URL
            [, this.owner, this.repo] = this.repoPath.match(/github\.com\/([^\/]+)\/([^\/]+)/) || [];
            if (!this.owner || !this.repo) throw new Error("La URL del repositorio no es válida.");

            const apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/tags`;
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                },
            });
            const tags = await response.json();

            let tagsFiltrados = await Promise.all(
                tags.map(async (tag: { name: string; commit: { sha: string } }) => {
                    const commitUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/commits/${tag.commit.sha}`;
                    const commitResponse = await fetch(commitUrl, {
                        headers: {
                            Authorization: `Bearer ${GITHUB_TOKEN}`,
                        },
                    });
                    const commitData = await commitResponse.json();

                    const fechaCommit = new Date(commitData.commit.author.date);
                    const esDelAño = fechaCommit.getFullYear().toString() === this.yearRepo;
                    const esEstable = !tag.name.match(/-rc|-beta|-alpha/); // Excluir versiones no estables

                    return esDelAño && esEstable ? tag : null;
                })
            );
            tagsFiltrados = tagsFiltrados.filter(tag => tag);
            console.log("Versiones estables del año: ", tagsFiltrados);
            const resultadosLTFC = await Promise.all(tagsFiltrados.map(async (tag: { name: string; commit: { sha: string } }) => {
                const commitUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/commits/${tag.commit.sha}`;
                const commitResponse = await fetch(commitUrl, {
                    headers: {
                        Authorization: `Bearer ${GITHUB_TOKEN}`,
                    },
                });
                const commitData = await commitResponse.json();
                const fechaVersion = new Date(commitData.commit.author.date);

                // Obtener el último commit ANTES del tag
                const commitsUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/commits?sha=${tag.commit.sha}&per_page=2`; // Aumentamos el número de commits consultados
                const commitsResponse = await fetch(commitsUrl, {
                    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
                });
                const commitsData = await commitsResponse.json();
                // Buscar el commit más cercano anterior al SHA del tag
                const commitPrevio = commitsData.reverse().find((commit: { commit: { author: { date: string } } }) => new Date(commit.commit.author.date) < fechaVersion);

                if (!commitPrevio) throw new Error("No se encontró un commit previo al tag.");

                const fechaCommit = new Date(commitPrevio.commit.author.date);

                // Calcular la diferencia en días
                const diferenciaDias = Math.round((fechaVersion.getTime() - fechaCommit.getTime()) / (1000 * 60 * 60 * 24));

                this.dataGraph.commit.push(commitPrevio.sha);
                this.dataGraph.dias.push(diferenciaDias);

                console.log(`Version: ${tag.name}, Fecha Version: ${fechaVersion.toISOString()}, Fecha Commit: ${fechaCommit.toISOString()}, Diferencia: ${diferenciaDias} días`);
                return { version: tag.name, dias: diferenciaDias };
            }));

            this.resultLTFC = this.calcPromedio(resultadosLTFC);
            this.makeGraph(this.dataGraph);
        } catch (error) {
            console.error("Error calculando Life Time for Changes: ", error);
            this.resultLTFC = 0;
        } finally {
            console.log("Life Time for Changes calculo terminado, resultado. " + this.resultLTFC + " días.");
        }
        return this.resultLTFC;
    }
    makeGraph(dataGraph: { dias: number[]; commit: string[] }) {
        const graphGenerator = new GraphGenerator(dataGraph, this.outputPath + `CalculoLTFC${this.repo}.png`);
        graphGenerator.exportToPNG();
    }
    terminate(): void {
        console.log("Calculo terminado, resultado: ", this.resultLTFC);
    }
    calcPromedio(resultadosLTFC: { version: string; dias: number; }[]): number {
        return resultadosLTFC.reduce((acumulador, resultado) => {
            return acumulador + resultado.dias;
        }, 0) / resultadosLTFC.length;
    }
}
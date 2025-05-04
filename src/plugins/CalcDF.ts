import { PluginOptions } from "./PluginOptions";

import { console } from "inspector";

import dotenv from 'dotenv';
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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

    async calcMetrics(...args: any[]): Promise<any> {
        let versionesEstables = [];
        try {
            // Extraer el owner y repo de la URL
            const [, owner, repo] = this.repoPath.match(/github\.com\/([^\/]+)\/([^\/]+)/) || [];
            if (!owner || !repo) throw new Error("La URL del repositorio no es válida.");

            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tags`;
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                },
            });
            const tags = await response.json();

            const tagsFiltrados = await Promise.all(
                tags.map(async (tag: { name: string; commit: { sha: string } }) => {
                    const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${tag.commit.sha}`;
                    const commitResponse = await fetch(commitUrl, {
                        headers: {
                            Authorization: `Bearer ${GITHUB_TOKEN}`,
                        },
                    });
                    const commitData = await commitResponse.json();

                    const fechaCommit = new Date(commitData.commit.author.date);
                    const esDelAño = fechaCommit.getFullYear().toString() === this.yearRepo;
                    const esEstable = !tag.name.match(/-rc|-beta|-alpha/); // Excluir versiones no estables

                    return esDelAño && esEstable ? tag.name : null;
                })
            );

            // Filtrar valores nulos y retornar los tags estables del año
            versionesEstables = tagsFiltrados.filter(tag => tag);
            this.resultDF = versionesEstables.length;
        } catch (error) {
            console.error("Error calculating Deployment Frequency: ", error);
            this.resultDF = 0;
        } finally {
            console.log("Deployment Frequency calculation finished.");
        }
        return versionesEstables.length;
    }

    terminate(): void {
        console.log("Calculo terminado, resultado: ", this.resultDF);
    }
}

import { PluginOptions } from "./PluginOptions";

import { console } from "inspector";

import dotenv from 'dotenv';
dotenv.config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

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
            const [, owner, repo] = this.repoPath.match(/github\.com\/([^\/]+)\/([^\/]+)/) || [];
            if (!owner || !repo) throw new Error("La URL del repositorio no es válida.");

            const apiUrl = `https://api.github.com/repos/${owner}/${repo}/tags`;
            const response = await fetch(apiUrl, {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                },
            });
            const tags = await response.json();

            const tagsEstables = await Promise.all(
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
            const tagsFallidos = await Promise.all(
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
                    // excluye todo menos las versiones con -rc al final del name

                    const esFallido = tag.name.endsWith("-rc");
                    return esDelAño && esFallido ? tag.name : null;
                })
            );
            versionesEstables = tagsEstables.filter(tag => tag);
            versionesFallidas = tagsFallidos.filter(tag => tag);
            this.resultCFR = (versionesFallidas.length / (versionesEstables.length + versionesFallidas.length)) * 100;
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

import { Chart, registerables, ChartConfiguration } from 'chart.js';
import { createCanvas } from 'canvas';
import fs from 'fs';

Chart.register(...registerables);

export class GraphGenerator {
  private width: number;
  private height: number;
  private canvas: any;
  private ctx: any;
  private chart: Chart | null = null;
  private outputPath: string;

  constructor(data: { dias: number[]; commit: string[] }, outputPath: string) {
    this.width = 800;
    this.height = 600;
    this.outputPath = outputPath;
    this.canvas = createCanvas(this.width, this.height);
    this.ctx = this.canvas.getContext('2d');
    this.createChart(data.dias, data.commit);
  }

  private createChart(data: number[], labels: string[]): void {
    const chartConfig: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Dias desde commit hasta desplegue',
            data,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            pointRadius: 5,
          },
        ],
      },
      options: {
        responsive: false,
        plugins: {
          legend: { display: true },
        },
      },
    }
    this.chart = new Chart(this.ctx, chartConfig);
  }

  public exportToPNG(): void {
    if (!this.chart) {
      console.error('El gráfico no se ha inicializado correctamente.');
      return;
    }

    const buffer = this.canvas.toBuffer('image/png');
    fs.writeFileSync(this.outputPath, buffer);
    console.log(`Gráfico exportado como "${this.outputPath}"`);
  }
}
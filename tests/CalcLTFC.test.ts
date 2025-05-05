import { CalcLTFC } from "../src/plugins/CalcLTFC";

describe("CalcLTFC - Datos reales", () => {
  let calcLTFC: CalcLTFC;

  beforeEach(() => {
    calcLTFC = new CalcLTFC("https://github.com/tensorflow/tensorflow", "src/de/guardado", "2024");
  });

  test("Inicialización correcta", () => {
    expect(calcLTFC.nameMetric).toBe("CalcLTFC");
    expect(calcLTFC.repoPath).toContain("https://github.com/tensorflow/tensorflow");
    expect(calcLTFC.yearRepo).toBe("2024");
    expect(calcLTFC.resultLTFC).toBe(0);
  });

  test("Método inicialize() muestra el mensaje de inicio", () => {
    calcLTFC.inicialize();
  });

  test("Método calcMetrics() se ejecuta sin errores", async () => {
    await expect(calcLTFC.calcMetrics()).resolves.not.toThrow();
  });

  test("Método calcMetrics() retorna un número mayor que 0", async () => {
    const resultadoLTFC = await calcLTFC.calcMetrics();
    console.log("Lead Time for Changes:", resultadoLTFC);
    expect(resultadoLTFC).toBeGreaterThan(0);
  });

  test("Método terminate() muestra el resultado final", () => {
    console.log = jest.fn();
    calcLTFC.terminate();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
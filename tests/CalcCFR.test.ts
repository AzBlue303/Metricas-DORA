import { CalcCFR } from "../src/plugins/CalcCFR";

describe("CalcCFR - Datos reales", () => {
  let calcCFR: CalcCFR;

  beforeEach(() => {
    calcCFR = new CalcCFR("https://github.com/tensorflow/tensorflow", "2024");
  });

  test("Inicialización correcta", () => {
    expect(calcCFR.nameMetric).toBe("CalcCFR");
    expect(calcCFR.repoPath).toContain("https://github.com/tensorflow/tensorflow");
    expect(calcCFR.yearRepo).toBe("2024");
    expect(calcCFR.resultCFR).toBe(0);
  });

  test("Método inicialize() muestra el mensaje de inicio", () => {
    calcCFR.inicialize();
  });

  test("Método calcMetrics() se ejecuta sin errores", async () => {
    await expect(calcCFR.calcMetrics()).resolves.not.toThrow();
  });

  test("Método calcMetrics() retorna un número entre 0 y 100", async () => {
    const resultadoCFR = await calcCFR.calcMetrics();
    console.log("Change Failure Rate:", resultadoCFR);
    expect(resultadoCFR).toBeGreaterThanOrEqual(0);
    expect(resultadoCFR).toBeLessThanOrEqual(100);
  });

  test("Método terminate() muestra el resultado final", () => {
    console.log = jest.fn();
    calcCFR.terminate();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
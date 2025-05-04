import { CalcDF } from "../src/plugins/CalcDF";

describe("CalcDF - Datos reales", () => {
  let calcDF: CalcDF;

  beforeEach(() => {
    calcDF = new CalcDF("https://github.com/tensorflow/tensorflow", "2024");
  });

  test("Inicialización correcta", () => {
    expect(calcDF.nameMetric).toBe("CalcDF");
    expect(calcDF.repoPath).toContain("https://github.com/tensorflow/tensorflow");
    expect(calcDF.yearRepo).toBe("2024");
    expect(calcDF.resultDF).toBe(0);
  });

  test("Método inicialize() muestra el mensaje de inicio", () => {
    calcDF.inicialize();
  });

  test("Método calcMetrics() se ejecuta sin errores", async () => {
    await expect(calcDF.calcMetrics()).resolves.not.toThrow();
  });

  test("Método calcMetrics() retorna un número mayor que 0", async () => {
    const resultadoDF = await calcDF.calcMetrics(); // Ejecuta el método y obtiene el resultado
    console.log("Número de versiones estables:", resultadoDF); // Muestra el valor obtenido
    expect(resultadoDF).toBeGreaterThan(0); // Verifica que sea mayor que 0
});

  test("Método terminate() muestra el resultado final", () => {
    console.log = jest.fn();
    calcDF.terminate();
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpiar mocks después de cada prueba
  });
});
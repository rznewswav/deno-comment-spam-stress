import { Controller } from "../utils/controller.ts";
import { S } from "../utils/response.util.ts";
import { Reply } from "../utils/response.util.ts";

type HealthFunction = () => Promise<string | null>

export class HealthController implements Controller {
  static readonly patients: Record<string, HealthFunction> = {}

  static registerPatient(name: string, fn: HealthFunction) {
    const wrappedFn = async (): Promise<string | null> => {
      return await Promise.race([
        fn(),
        new Promise<string>(res => setTimeout(() => res("health check timed out"), 3000))
      ])
    }

    return HealthController.patients[name] = wrappedFn
  }

  method = "get";
  path = "/api/v1/health";
  middlewares?: Controller[] | undefined;
  async handle(_: Request): Promise<Reply> {
    const healthTasks = Object.entries(HealthController.patients).map(async([patient, fn]) => ({
      name: patient,
      diagnosis: await fn()
    }))
    const patients = await Promise.all(healthTasks)
    const healthy = patients.every(e => e.diagnosis === null)
    return S({
      healthy,
      patients,
    });
  }
}

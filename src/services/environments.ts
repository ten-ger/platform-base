class EnvironmentsController {

  async getEnvironments() {
    const envFile = await fetch('/environments.json');
    let envSettings = await envFile.json();
    return envSettings.environments;
  }
}
export const EnvironmentsService = new EnvironmentsController();
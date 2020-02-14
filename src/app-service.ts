import { App } from "./app";

export abstract class AppService {

  constructor() {
    App.$initiallize.subscribe({
      next: app => this.onInit(app)
    });
  }

  protected onInit(instance: App): void {};
} 

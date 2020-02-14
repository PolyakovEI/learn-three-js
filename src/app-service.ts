import { App } from "./app";

export abstract class AppService {

  constructor() {
    App.$initiallize.subscribe({
      next: () => this.onInit()
    });
  }

  protected onInit(): void {};
} 

import { Context } from 'egg';

export default class ProcessCache {
  cache: { [key: string]: any };
  ctx: Context;

  constructor(ctx: Context) {
    this.ctx = ctx;
    this.cache = {};
  }

  public get(processId: string) {
    return new Promise(resolve => {
      resolve(this.cache[processId]);
    });
  }

  public set(processId: string, data: any) {
    return new Promise<void>(resolve => {
      this.cache[processId] = data;
      resolve();
    });
  }

  public remove(processId: string) {
    return new Promise<void>(resolve => {
      delete this.cache[processId];
      resolve();
    });
  }
}
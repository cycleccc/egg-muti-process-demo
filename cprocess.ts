import { EventEmitter } from 'events';
import { Context } from 'egg';
import ProcessCache from './process-cache';
import { v4 as uuid } from 'uuid';
import CPS from './cps';
import STATUS from '/src/modules/process/status';

export default class CProcess extends EventEmitter {
  ctx: Context;
  cache: ProcessCache;
  run: any;
  uid: string;
  constructor(ctx: Context) {
    super();
    this.ctx = ctx;
    this.cache = new ProcessCache(ctx);
  }
  public async getStatus(processId: string) {
    // 取得对应进程
    const item = await this.cache.get(processId);
    return item?.status;
  }
  public async stop(processId: string) {
    // 取得对应进程
    const item = await this.cache.get(processId);
    if (item) {
      if (item.cps) {
        item.cps.stop();
      } else if (item.pid) {
        const cps = new CPS('');
        cps.stopByPid(item.pid);
      }
      this.cache.remove(processId);
    } else {
      this.ctx.logger.error('process has stoped', processId);
    }
  }
  /**
     * 启动流程：
     */
  public async start(run: any) {
    const uid = this.uuid();
    const cps = new CPS(run);
    console.log('before cprocess run');
    const pid = await cps.run();
    console.log('cprocess run : ', pid);
    await this.cache.set(uid, {
      pid,
      cps,
      status: STATUS.RUNNING,
    });
    return {
      cps,
      uid,
      status: STATUS.RUNNING,
    };
  }
  public sendMessage = async (processId, msg) => {
    const item = await this.cache.get(processId);
    if (item?.cps) {
      item.cps.sendMessage(msg);
    }
  };
  public uuid() {
    const uid = `crawler_process-${uuid()}-${Date.now()}`;
    return uid;
  }
}

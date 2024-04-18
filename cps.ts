// eslint-disable-next-line no-restricted-imports
import { EventEmitter } from 'events';
// eslint-disable-next-line no-restricted-imports
import * as child from 'child_process';
import { isBuffer } from 'lodash';
import * as iconv from 'iconv-lite';

export default class CPS extends EventEmitter {
  params: any;
  proc: any;
  constructor(params) {
    super();
    this.params = params;
    // this.run();
  }
  log = (...args) => {
    console.log('cps log: ', ...args);
  };
  error = (...args) => {
    console.error('cps error: ', ...args);
  };
    /**
       * 运行
       *  - 解析参数
       *  - 创建进程
       */
  async run() {
    const args = this.processCMD();
    const proc: any = await this.makeProcess(args);
    const pid = proc?.pid;
    return pid;
  }
  stopByPid(pid?) {
    const { proc } = this;
    pid = pid || proc?.pid;
    try {
      console.log('kill by pid: ', pid);
      child.spawn('kill', [ pid ]);
    } catch (err) {
      console.log('stop by pid error: ', err.message);
    }
  }
  stopByKill() {
    const { proc } = this;
    try {
      proc.kill('SIGTERM');
    } catch (err) {
      console.log('stop by kill error: ', err.message);
    }
  }
  stop() {
    const { proc } = this;
    try {
      this.log('begin stop child process');
      if (proc) {
        proc.send?.(JSON.stringify(0));
        this.stopByPid();
        this.stopByKill();
        this.log('stoped success', proc.killed);
      }
    } catch (err) {
      this.error('stop error', (err as any).message);
    }
  }
  /**
       * 解析实际执行命令
       *  - 命令行脚本：xxx/xxx/xxx.(js|ts)
       */
  processCMD() {
    const { params } = this;
    const args = params.split(/[\s\=]+/g).map(v => v.trim()).filter(v => v)
      .slice(1);
    return args;
  }
  public sendMessage = msg => {
    if (this.proc) {
      this.proc.send(msg);
    }
  };
  async makeProcess(args) {
    return new Promise((resolve, reject) => {
      const [ script, ...execArgv ] = args;
      this.log('child process ', script, execArgv);
      const proc: any = child.fork(script, [ execArgv ], {
        silent: true,
      });
      if (!proc) {
        reject('child not work');
      }
      this.proc = proc;
      proc.stdout?.on('data', data => {
        if (isBuffer(data)) {
          data = iconv.decode(data, 'utf8');
        }
        this.log('data', data);
        this.emit('data', data);
      });

      proc.stderr?.on('data', data => {
        if (isBuffer(data)) {
          data = iconv.decode(data, 'utf8');
        }
        this.error('data', data);
        this.emit('data', data);
      });

      proc.on('error', e => {
        let message = e.message;
        if (isBuffer(message)) {
          message = iconv.decode(message, 'utf8');
        }
        this.error(message);
        this.emit('error', message);
      });

      proc.on('exit', code => {
        this.log('Exit ', code);
      });

      proc.on('close', code => {
        if (code !== 0) {
          this.error('Close ', code);
        } else {
          this.log('Close ', code);
        }
      });
      resolve(proc);
    });
  }
}

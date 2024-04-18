
import { EggLogger } from 'egg';
import { SingletonProto, AccessLevel, Inject } from '@eggjs/tegg';
import { spawn } from 'child_process';

@SingletonProto({
  accessLevel: AccessLevel.PUBLIC,
})
export class ChildProcessService {
  @Inject()
  logger: EggLogger;

  // 封装业务
  async runChildProcess(): Promise<void> {
    // 启动子进程
    const child = spawn('node', [ 'path_to_your_eggjs_app/index.js' ]);

    // 监听子进程的输出
    child.stdout.on('data', data => {
      console.log(`子进程输出：${data}`);
    });

    // 监听子进程的错误
    child.stderr.on('data', data => {
      console.error(`子进程错误：${data}`);
    });

    // 向子进程发送消息
    child.stdin.write('Hello from parent process!\n');
    child.stdin.end();
  }

}
